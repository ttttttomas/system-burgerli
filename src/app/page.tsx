"use client";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

import {useSession} from "./context/SessionContext";

export default function HomePage() {
  const {session, loading} = useSession();
  const router = useRouter();

  console.log(session);

  useEffect(() => {
    // Esperar a que termine de cargar antes de hacer cualquier redirección
    if (loading) {
      return;
    }

    if (!session) {
      console.log("No hay sesión");
      router.push("/login");

      return;
    }

    if (session.rol === "admin") {
      console.log("Es un admin");
      router.push("/admin");
    } else if (session.rol === "employed") {
      console.log("Es un empleado");
      router.push("/pedidos");
    }
  }, [session, loading, router]);

  // Mostrar un indicador de carga mientras se verifica la sesión
  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-[#fdecc9]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#b36912]" />
          <p className="mt-4 text-[#4b2f1e]">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  return null;
}
