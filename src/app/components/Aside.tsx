"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";

import Pedidos from "./Pedidos";
import Historial from "./Historial";

export default function Aside() {
  const path = usePathname();

  return (
    <>
      {path !== "/login" && (
        <aside className="fixed flex h-full w-72 flex-col gap-5 bg-[#2D2D2D] p-8">
          <img alt="Logo Burgerli" className="mx-auto w-auto" src="/logo.png" />
          <p className="my-5 text-center text-2xl font-bold">Burgerli - Lanus</p>
          <ul className="flex flex-col items-start gap-5">
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
    </>
  );
}
