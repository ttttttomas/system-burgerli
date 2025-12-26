"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useSession } from "../context/SessionContext";

import Pedidos from "./Pedidos";
import Historial from "./Historial";
import Analiticas from "./Analiticas";
import Store from "./Store";

export default function Aside() {
  const { session, logoutUser } = useSession();
  const path = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móviles */}
      {session && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 lg:hidden bg-[#2D2D2D] p-3 rounded-lg text-white hover:bg-[#3D3D3D] transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {/* Overlay para cerrar el menú en móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {session?.rol === "employed" && (
        <aside
          className={`fixed flex justify-start h-full w-72 flex-col gap-8 bg-[#2D2D2D] p-8 z-40 transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <img alt="Logo Burgerli" className="mx-auto w-auto" src="/logo.png" />
          <p className="my-5 text-center text-2xl font-bold text-white">
            Burgerli - {session?.local}
          </p>
          <ul className="flex flex-col items-start gap-5 text-white">
            <Link className="flex items-center gap-3" href="/" onClick={closeMenu}>
              <Pedidos />
              <p>Pedidos</p>
            </Link>
            <Link className="flex items-center gap-3" href="/orders" onClick={closeMenu}>
              <Historial />
              <p>Historial de pedidos</p>
            </Link>
          </ul>
          <button
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
            className="cursor-pointer bg-red-500 py-2 rounded-xl text-black font-semibold text-lg hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </aside>
      )}
      {session?.rol === "admin" && (
        <aside
          className={`fixed justify-start flex h-full w-72 flex-col gap-5 bg-[#2D2D2D] p-8 z-40 transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <img alt="Logo Burgerli" className="mx-auto w-auto" src="/logo.png" />
          <p className="my-5 text-center text-2xl font-bold">Administrador</p>
          <ul className="flex flex-col items-start gap-8">
            <div className="flex items-center text-gray-500 gap-3">
              <Analiticas />
              <p>Anatilicas</p>
            </div>
            <div className="flex items-center text-gray-500 gap-3">
              <Pedidos />
              <p>Menu</p>
            </div>
            <div className="flex items-center text-gray-500 gap-3">
              <Historial />
              <p>Historial de compras</p>
            </div>
            <Link
              className="flex items-center gap-3"
              href="/change-local-status"
              onClick={closeMenu}
            >
              <Store />
              <p>Locales</p>
            </Link>
          </ul>
          <button
            onClick={() => {
              handleLogout();
              closeMenu();
            }}
            className="cursor-pointer bg-red-500 py-2 rounded-xl text-black font-semibold text-lg hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </aside>
      )}
    </>
  );
}
