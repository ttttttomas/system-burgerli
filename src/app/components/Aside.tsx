"use client";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";

import {useSession} from "../context/SessionContext";

import Pedidos from "./Pedidos";
import Historial from "./Historial";
import Analiticas from "./Analiticas";

export default function Aside() {
  const {session, logoutUser} = useSession();
  const path = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
    // Forzar recarga para limpiar todo el estado
    // setTimeout(() => {
    //     window.location.href = '/';
    // }, 100);
}

  return (
    <>
      {session?.rol === "employed" && (
        <aside className="fixed flex justify-start h-full w-72 flex-col gap-8 bg-[#2D2D2D] p-8">
          <img alt="Logo Burgerli" className="mx-auto w-auto" src="/logo.png" />
          <p className="my-5 text-center text-2xl font-bold text-white">
            Burgerli - {session?.local}
          </p>
          <ul className="flex flex-col items-start gap-5 text-white">
            <Link className="flex items-center gap-3" href="/">
              <Pedidos />
              <p>Pedidos</p>
            </Link>
            <Link className="flex items-center gap-3" href="/orders">
              <Historial />
              <p>Historial de pedidos</p>
            </Link>
          </ul>
          <button onClick={handleLogout} className="cursor-pointer bg-red-500 py-2 rounded-xl text-black font-semibold text-lg">Cerrar sesión</button>
        </aside>
      )}
      {session?.rol === "admin" && (
        <aside className="fixed justify-start flex h-full w-72 flex-col gap-5 bg-[#2D2D2D] p-8">
          <img alt="Logo Burgerli" className="mx-auto w-auto" src="/logo.png" />
          <p className="my-5 text-center text-2xl font-bold">Administrador</p>
          <ul className="flex flex-col items-start gap-8">
            <Link className="flex items-center gap-3" href="/admin">
              <Analiticas />
              <p>Anatilicas</p>
            </Link>
            <Link className="flex items-center gap-3" href="/menu">
              <Pedidos />
              <p>Menu</p>
            </Link>
            <Link className="flex items-center gap-3" href="/orders-history">
              <Historial />
              <p>Historial de compras</p>
            </Link>
          </ul>
          <button onClick={handleLogout} className="cursor-pointer bg-red-500 py-2 rounded-xl text-black font-semibold text-lg">Cerrar sesión</button>
        </aside>
      )}
    </>
  );
}
