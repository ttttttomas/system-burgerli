"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "./context/SessionContext";

type UserRole = "admin" | "employed";

const ROLE_ROUTE: Record<UserRole, string> = {
  admin: "/admin",
  employed: "/pedidos",
};

export default function HomePage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1) Mientras carga la sesión, no hacemos nada
    if (loading) return;

    // 2) Sin sesión -> al login
    if (!session) {
      console.log("No hay sesión, redirigiendo a /login");
      router.replace("/login");
      return;
    }

    // 3) Con sesión -> redirigir según rol
    const rol = session.rol as UserRole | undefined;
    const target = rol ? ROLE_ROUTE[rol] : "/pedidos"; // ruta por defecto
    console.log(rol);
    

    console.log(`Usuario con rol ${rol ?? "desconocido"}, a ${target}`);
    router.replace(target);
  }, [session, loading, router]);

  // Mientras se resuelve todo, mostramos loader
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#b36921]" />
        <p className="mt-4 text-[#4b2f1e]">Verificando sesión...</p>
      </div>
    </main>
  );
}
