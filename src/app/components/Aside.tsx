"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSession } from "../context/SessionContext";

import Pedidos from "./Pedidos";
import Historial from "./Historial";
import Analiticas from "./Analiticas";
import Store from "./Store";
import { toast } from "sonner";


interface Local {
  id: string;
  name: string;
  is_open: number;
}

export default function Aside() {
  const { session, logoutUser, locals } = useSession();
  const [updatingLocal, setUpdatingLocal] = useState<string | null>(null);
  const path = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [localData, setLocalData] = useState<Local | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(true);

  useEffect(() => {
    const fetchLocalData = async () => {
      if (session?.rol === "employed" && session?.local) {
        try {
          setLoadingLocal(true);
          const data = await locals();
          console.log("Locales obtenidos:", data);
          
          // Buscar el local de la sesión activa
          const currentLocal = data.find((local: Local) => local.name === session.local);
          
          if (currentLocal) {
            console.log("Local actual:", currentLocal);
            setLocalData(currentLocal);
          } else {
            console.warn("No se encontró el local de la sesión");
            setLocalData(null);
          }
        } catch (error) {
          console.error("Error al obtener locales:", error);
          setLocalData(null);
        } finally {
          setLoadingLocal(false);
        }
      }
    };
    
    fetchLocalData();
  }, [session?.local, session?.rol]);

  const handleToggleStatus = async (localName: string, currentStatus: number) => {
    try {
      setUpdatingLocal(localName);
      const newStatus = currentStatus === 1 ? false : true;
      
      const apiFetch = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/updateLocalStatus/${localName}`;
      
      const response = await fetch(apiFetch, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      // Actualizar el estado local
      setLocalData((prevLocal) => {
        if (prevLocal && prevLocal.name === localName) {
          return { ...prevLocal, is_open: newStatus ? 1 : 0 };
        }
        return prevLocal;
      });

      console.log(`✅ Estado del local ${localName} actualizado a ${newStatus ? "Abierto" : "Cerrado"}`);
      toast.success(`✅ Estado del local ${localName} actualizado a ${newStatus ? "Abierto" : "Cerrado"}`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al cambiar el estado del local");
    } finally {
      setUpdatingLocal(null);
    }
  };

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
          {/* Control de estado del local */}
          <div className="w-full mb-4">
            {loadingLocal ? (
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : localData ? (
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium text-sm">Estado del local:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs ${
                      localData.is_open === 1
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {localData.is_open === 1 ? "🟢 Abierto" : "🔴 Cerrado"}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(session.local!, localData.is_open)}
                  disabled={updatingLocal === session.local}
                  className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all ${
                    updatingLocal === session.local
                      ? "bg-gray-500 cursor-not-allowed"
                      : localData.is_open === 1
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "bg-green-700 hover:bg-green-800 text-white"
                  }`}
                >
                  {updatingLocal === session.local ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Actualizando...
                    </span>
                  ) : localData.is_open === 1 ? (
                    "Cerrar Local"
                  ) : (
                    "Abrir Local"
                  )}
                </button>
              </div>
            ) : null}
          </div>

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
            <Link href="/admin" className="flex items-center gap-3">
              <Analiticas />
              <p>Anatilicas</p>
            </Link>
            <div className="flex items-center text-gray-500 gap-3">
              <Pedidos />
              <p>Menu</p>
            </div>
            <Link href="orders-history" className="flex items-center gap-3">
              <Historial />
              <p>Historial de compras</p>
            </Link>
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
