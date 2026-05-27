# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Sistema de gestión interno para Burgerli (hamburguesería). Es una SPA Next.js 15 (App Router) que consume un backend externo en `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api` (FastAPI por la pinta de los endpoints) y se comunica en tiempo real por WebSocket. Convive un endpoint legacy con el host `burgerli.ar` (sin `.com`) en `useAuth.ts` — eso es intencional (auth) en este código actual, no unificarlo sin pedir confirmación.

Idioma del proyecto: **español** (UI, mensajes de error, comentarios). Mantener ese idioma al editar.

## Common commands

Trabajar desde la raíz del repo (`system-burgerli/`), no desde `src/app/`. La raíz contiene `package.json`, `next.config.ts`, etc.

```bash
pnpm dev        # next dev --turbopack — server en :3000
pnpm build      # next build (producción)
pnpm start      # next start
pnpm lint       # next lint
```

No hay framework de tests configurado; no inventar `pnpm test`.

Package manager: **pnpm** (existe `pnpm-lock.yaml`). No mezclar con npm/yarn.

## Architecture

### Layout de carpetas

- `src/app/` — App Router de Next. Cada subcarpeta con `page.tsx` es una ruta (`/admin`, `/menu`, `/orders`, `/orders-history`, `/pedidos`, `/stock`, `/create-order`, `/login`, `/change-local-status`).
- `src/app/components/` — componentes compartidos. Conviven `.tsx` (los nuevos / con tipos) y `.jsx` (mayoría son íconos SVG simples: `Cruz`, `Lupa`, `Moto`, `Pedidos`, `Store`, `Tarjeta`, `Ubicacion`, `Horarios`, `Analiticas`, `NewOrderIcon`, `PopupIcon`, `Historial`). La lógica real está en los `.tsx`.
- `src/app/context/` — `SessionContext` (auth + sesión + helpers de fetch reusables) y `OrdersContext` (estado de órdenes en vivo + WebSocket + audio + persistencia en localStorage).
- `src/app/hooks/` — `useAuth.ts` (auth + endpoints relacionados a sesión/locales/órdenes), `useProducts.ts` (CRUD de productos del menú: burgers/fries/drinks/promos/coupons + `createOrder`).
- `src/app/api/auth/logout/route.ts` — única route handler local; el resto de la API es remota.
- `src/lib/utils.ts` — helper `cn()` de shadcn/clsx+tailwind-merge.
- `src/lib/ProductsToJson.ts` — `parseLineItems()`, parser defensivo del array `products` de una orden (los items pueden venir como JSON-string, objeto, etc. — siempre asumir formato heterogéneo).
- `src/middleware.ts` — middleware Next que protege rutas y filtra acceso por rol leyendo el JWT manualmente desde la cookie `Authorization`.
- `src/types.ts` — tipos compartidos (`Orders`, `ProductsOrder`, `SessionUser`, `CreatePromoInput`, `UpdatePromoInput`).

### Auth y rutas protegidas

Sesión basada en cookie `Authorization` (JWT) emitida por el backend remoto. El middleware (`src/middleware.ts`):

1. Deja pasar libremente todo lo que NO sea `/orders`, `/pedidos`, `/admin`, `/change-local-status`, `/orders-history`, `/menu`.
2. Si la ruta es protegida y no hay cookie → redirige a `/login`.
3. Si la ruta empieza con `/admin`, decodifica el payload del JWT (`atob`, sin verificar firma) y exige `rol === "admin"`; cualquier otro rol va a `/`.

`/` (página raíz, `src/app/page.tsx`) no es protegida por el middleware: hace ruteo client-side por rol vía `SessionContext`. `admin` → `/admin`, `employed` → `/pedidos`, default → `/pedidos`. Cualquier ruta protegida añadida en el futuro debe sumarse al array `protectedRoutes` del middleware.

`SessionContext` llama `/verify-cookie` al montar para hidratar la sesión. `loginUser` hace POST a `/token` y luego re-verifica. `logoutUser` limpia tanto el backend remoto como cookies locales (vía `src/app/api/auth/logout/route.ts`).

### Flujo de órdenes en tiempo real

`OrdersContext` mantiene tres listas: `newOrders`, `ordersInPreparation`, `ordersReady`, persistidas en `localStorage` con clave por local (`newOrders_<local>`, etc.). Particularidades importantes:

- **WebSocket** a `wss://burgerli.com.ar/.../api/ws/orders` con reconexión automática a 3s. Recibe eventos `new_order` y `status_update` y filtra por `local` (lowercase) para que cada dashboard solo vea sus órdenes.
- Las transiciones de estado (`moveToPreparation`, `moveToReady`, `markAsDelivered`, `cancelOrder`) hacen optimistic update local + `PATCH`/`DELETE` al backend. **No hay rollback si la API falla** — solo se loguea el error.
- Los estados que persiste el backend son strings inglés (`"in_preparation"`, `"on_the_way"`, `"delivered"`, `"confirmed"`), pero los eventos WS llegan en español (`"En preparación"`, `"Listo para retirar"`, `"Entregado"`). Mantener este mapeo al tocar transiciones.
- `dailySequenceNumber` es un contador local diario por sucursal (no viene del backend); se persiste en `localStorage` con clave `sequenceCounter_<local>` y se reinicia comparando contra `sequenceDate_<local>`.
- Notificaciones de audio (`/notification-sound.mp3`) requieren un gesto del usuario para autorizarse; el banner `showAudioBanner` lo gestiona y guarda el flag en `localStorage` (`audioNotificationsEnabled`).
- Hay un evento custom `ordersUpdated` que `SessionContext` dispara al cargar órdenes confirmadas y `OrdersContext` escucha para recargar desde `localStorage`. No reemplazar este puente con un import directo sin pensarlo: rompe el orden de montaje de los providers.

`SessionContextProvider` envuelve a `OrdersContextProvider` en `layout.tsx` — `OrdersContext` depende de `useSession()`, no invertir el orden.

### API remota

Todo el dominio de negocio vive en el backend externo. Los hooks `useAuth` y `useProducts` concentran las llamadas (axios para GETs/PATCH/DELETE; `fetch` nativo en algunos puntos críticos como `createOrder` y los `PATCH /status` desde `OrdersContext`). La URL base aparece literal en cada función — si vas a tocar varias, considerá centralizarla, pero no lo hagas como cleanup gratuito si la tarea no lo pide.

Endpoints conocidos (referencia, no exhaustivo):
- Auth: `/token`, `/verify-cookie`, `/logout`, `/me`
- Órdenes: `/getOrders`, `/getOrdersByLocalStatusConfirmed/{local}`, `/createOrder`, `/{id}/status` (PATCH), `/deleteOrder/{id}`
- Catálogo: `/burgers`, `/fries`, `/drinks`, `/promos`, `/coupons` y sus `/{id}/stock/{localId}` (PATCH)
- Locales: `/getLocals`, `/getLocal/{name}`, `/updateLocalStatus/{localName}` (PUT)

### Tickets / impresión térmica

Hay dos paths para imprimir un comprobante 58mm:

- `components/TicketPrinter.tsx` (`buildReceipt`) — usa `react-thermal-printer` (impresión por bytes a impresora real, p. ej. ESC/POS).
- `components/TicketPrinterButton.tsx` (`buildReceiptHTML`) — abre una ventana con HTML/CSS y dispara `window.print()` (camino "imprimir desde el browser"). Calcula la altura dinámica de `@page` en mm.

Lógica de totales: si `payment_method === "Efectivo"`, mostrar solo total; si no, descomponer en subtotal + 8% de servicio (la comisión está embebida en `order.price` y se extrae con `total * 0.08 / 1.08`). Mantener el cálculo si tocás cualquiera de los dos archivos.

## Conventions

- **TypeScript estricto** (`strict: true` en `tsconfig.json`). El alias `@/*` mapea a `src/*`.
- **React 19 + React Compiler** habilitado (`experimental.reactCompiler: true` y la regla `react-compiler/react-compiler: "error"`). Evitar mutaciones que el compiler considere unsafe; si ESLint te pinta algo de `react-compiler`, no lo silencies sin entender por qué.
- **Tailwind v4** (`@tailwindcss/postcss`). Variables CSS y baseColor `zinc` configurados en `globals.css`. No hay `tailwind.config`.
- **shadcn/ui** configurado (`components.json`, style `new-york`, alias `@/components/ui`) — no hay componentes shadcn instalados todavía, pero la convención está lista.
- **Prettier**: `printWidth: 100`, `singleQuote: false`, `bracketSpacing: false`, `trailingComma: "all"`, `arrowParens: "always"`, plugin `prettier-plugin-tailwindcss`. Lo aplica ESLint como `warn`.
- ESLint tiene `import/order` ordenado por grupos con `"newlines-between": "always"` — al agregar imports, mantené el orden o el lint chilla.
- Reglas relajadas a propósito: `no-console: "off"`, `@typescript-eslint/no-explicit-any: "off"`, `react/prop-types: "off"`. No las re-actives.
- Hay `"use client"` en casi todo lo interactivo. El layout root (`layout.tsx`) es server por defecto pero envuelve providers client.
- Notificaciones al usuario: `sonner` (`toast.success` / `toast.error`) — ya hay `<Toaster position="top-center" richColors />` en el layout.

## Things to know before editing

- El cwd inicial reportado por el harness puede ser `src/app/`, pero la raíz del proyecto Next es `system-burgerli/`. Comandos como `pnpm dev` se corren desde la raíz.
- `tsconfig.json` incluye explícitamente `"src/app/components/Pedidos.jsx"` aunque la mayoría de los `.jsx` de íconos no están listados. `allowJs: true` los permite igual.
- Cuando agregues una ruta nueva que requiera login, recordá sumarla a `protectedRoutes` en `src/middleware.ts` — el matcher excluye `/api`, assets y `_next/*`, no rutas de página.
- `parseLineItems` en `src/lib/ProductsToJson.ts` filtra silenciosamente cualquier item que no parezca JSON. Si una pantalla muestra menos productos de los esperados, ese parser es el primer sospechoso.
- En `OrdersContext.tsx`, los handlers `moveToPreparation`/`moveToReady`/`markAsDelivered` referencian la URL del backend hardcodeada **además** de la versión vía hook. Si cambiás el dominio del backend, hay que actualizarlo en varios lugares (hooks + contexts + middleware no, este último parsea solo el JWT local).
