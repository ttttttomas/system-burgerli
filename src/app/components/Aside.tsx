"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

import {useSession} from "../context/SessionContext";

import Pedidos from "./Pedidos";
import Historial from "./Historial";
import Analiticas from "./Analiticas";

export default function Aside() {
  const {session} = useSession();
  const path = usePathname();

  return (
    <>
      {session?.rol === "employed" && (
        <aside className="fixed flex h-full w-72 flex-col gap-8 bg-[#2D2D2D] p-8">
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
        </aside>
      )}
      {session?.rol === "admin" && (
        <aside className="fixed flex h-full w-72 flex-col gap-5 bg-[#2D2D2D] p-8">
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
        </aside>
      )}
    </>
  );
}
