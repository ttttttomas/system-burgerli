"use client";

import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";

interface Local {
  id: string;
  name: string;
  is_open: number;
}

export default function LocalsPage() {
  const { locals } = useSession();
  const [localsData, setLocalsData] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLocal, setUpdatingLocal] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocals = async () => {
      try {
        setLoading(true);
        const data = await locals();
        console.log("Locales obtenidos:", data);
        setLocalsData(data || []);
      } catch (error) {
        console.error("Error al obtener locales:", error);
        alert("Error al cargar los locales");
      } finally {
        setLoading(false);
      }
    };
    fetchLocals();
  }, []);

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
      setLocalsData((prevLocals) =>
        prevLocals.map((local) =>
          local.name === localName
            ? { ...local, is_open: newStatus ? 1 : 0 }
            : local
        )
      );

      console.log(`✅ Estado del local ${localName} actualizado a ${newStatus ? "Abierto" : "Cerrado"}`);
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Error al cambiar el estado del local");
    } finally {
      setUpdatingLocal(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen md:pt-20 lg:pt-10 px-4 lg:ml-72 lg:mr-10">
        <h1 className="text-center text-2xl lg:text-3xl font-bold mb-8 text-black">
          Gestión de Locales
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen md:pt-20 lg:pt-10 px-4 lg:ml-72 lg:mr-10">
      <h1 className="text-center text-2xl lg:text-3xl font-bold mb-8 text-black">
        Gestión de Locales
      </h1>
      
      {localsData.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          <p className="text-xl">No hay locales disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {localsData.map((local) => (
            <div
              key={local.id}
              className="bg-[#2D2D2D] rounded-lg shadow-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex flex-col gap-4">
                {/* Nombre del local */}
                <h2 className="text-2xl font-bold text-white text-center">
                  {local.name.charAt(0).toUpperCase() + local.name.slice(1)}
                </h2>

                {/* Estado actual */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-gray-300 font-medium">Estado:</span>
                  <span
                    className={`px-4 py-2 rounded-full font-bold text-sm ${
                      local.is_open === 1
                        ? "bg-green-600 text-black"
                        : "bg-red-700 text-white"
                    }`}
                  >
                    {local.is_open === 1 ? "🟢 Abierto" : "🔴 Cerrado"}
                  </span>
                </div>

                {/* Botón de toggle */}
                <button
                  onClick={() => handleToggleStatus(local.name, local.is_open)}
                  disabled={updatingLocal === local.name}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                    updatingLocal === local.name
                      ? "bg-gray-500 cursor-not-allowed"
                      : local.is_open === 1
                      ? "bg-red-700 hover:bg-red-700 text-white"
                      : "bg-green-700 hover:bg-green-700 text-white"
                  }`}
                >
                  {updatingLocal === local.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Actualizando...
                    </span>
                  ) : local.is_open === 1 ? (
                    "Cerrar Local"
                  ) : (
                    "Abrir Local"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
