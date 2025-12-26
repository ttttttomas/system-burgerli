// middleware.ts
import { NextRequest, NextResponse, NextMiddleware } from "next/server";

const protectedRoutes = ["/orders", "/pedidos", "/admin", "/change-local-status", "/orders-history", "/menu"];

function isProtectedPath(pathname: string) {
  return protectedRoutes.some((p) => pathname.startsWith(p));
}

// Lee el payload del JWT y devuelve el rol (o null)
function getRoleFromToken(token?: string): string | null {
  if (!token) return null;

  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const payloadJson = atob(
      base64Payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(payloadJson) as { rol?: string };

    return payload.rol ?? null;
  } catch (err) {
    console.error("Error parsing token in middleware:", err);
    return null;
  }
}

const middleware: NextMiddleware = (req: NextRequest) => {
  const authorizationCookie = req.cookies.get("Authorization")?.value;
  const { pathname } = req.nextUrl;

  // 1) Si la ruta NO es protegida, dejar pasar siempre
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // 2) Si no hay sesión -> al login
  if (!authorizationCookie) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // 3) Si la ruta es /admin, chequeamos rol
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute) {
    const role = getRoleFromToken(authorizationCookie);
    console.log("Role de la sesión:", role);
    
    // si no es admin, lo echamos (podés mandarlo al home o a /403)
    if (role !== "admin") {
      const url = new URL("/", req.url); // o "/403"
      return NextResponse.redirect(url);
    }
    else{
      return NextResponse.next();
    }
  }

  return NextResponse.next();
};

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export default middleware;
