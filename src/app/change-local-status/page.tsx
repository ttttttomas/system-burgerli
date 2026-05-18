"use client";

import { useEffect, useState } from "react";
import { useSession } from "../context/SessionContext";

interface TurnSchedule {
  apertura: string;
  cierre: string;
}

interface ParsedSchedule {
  [dayIndex: string]: TurnSchedule[] | null;
}

interface Local {
  id: string;
  name: string;
  is_open: number;
  opening_hours: string;
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function parseOpeningHours(raw: string | null | undefined): ParsedSchedule | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    console.error("Error parseando opening_hours:", raw);
    return null;
  }
}

export default function LocalsPage() {
  const { locals } = useSession();
  const [localsData, setLocalsData] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingLocal, setUpdatingLocal] = useState<string | null>(null);
  const [expandedHorarios, setExpandedHorarios] = useState<Record<string, boolean>>({});
  const [editedSchedules, setEditedSchedules] = useState<Record<string, ParsedSchedule>>({});
  const [savingSchedule, setSavingSchedule] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocals = async () => {
      try {
        setLoading(true);
        const data = await locals();
        console.log("Locales obtenidos:", data);
        setLocalsData(data || []);

        // Initialize editable schedules from API data
        const initialSchedules: Record<string, ParsedSchedule> = {};
        (data || []).forEach((local: Local) => {
          const parsed = parseOpeningHours(local.opening_hours);
          if (parsed) {
            initialSchedules[local.name] = parsed;
          }
        });
        setEditedSchedules(initialSchedules);
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

  const toggleHorarios = (localName: string) => {
    setExpandedHorarios((prev) => ({
      ...prev,
      [localName]: !prev[localName],
    }));
  };

  const handleTimeChange = (
    localName: string,
    dayIndex: number,
    turnIndex: number,
    field: "apertura" | "cierre",
    value: string
  ) => {
    setEditedSchedules((prev) => {
      const localSchedule = { ...prev[localName] };
      const dayKey = String(dayIndex);
      const turns = [...(localSchedule[dayKey] || [])];
      turns[turnIndex] = { ...turns[turnIndex], [field]: value };
      localSchedule[dayKey] = turns;
      return { ...prev, [localName]: localSchedule };
    });
  };

  const handleToggleDayClosed = (localName: string, dayIndex: number) => {
    setEditedSchedules((prev) => {
      const localSchedule = { ...prev[localName] };
      const dayKey = String(dayIndex);
      if (localSchedule[dayKey] === null) {
        // Reopen with default times
        localSchedule[dayKey] = [
          { apertura: "12:00", cierre: "15:30" },
          { apertura: "20:00", cierre: "23:30" },
        ];
      } else {
        localSchedule[dayKey] = null;
      }
      return { ...prev, [localName]: localSchedule };
    });
  };

  const handleSaveSchedule = async (localName: string) => {
    try {
      setSavingSchedule(localName);
      const schedule = editedSchedules[localName];

      if (!schedule) {
        alert("No hay horarios para guardar");
        return;
      }

      const apiFetch = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/updateLocalOpeningHours/${localName}`;

      const response = await fetch(apiFetch, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opening_hours: schedule }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los horarios");
      }

      console.log(`✅ Horarios del local ${localName} actualizados correctamente`);
      alert(`Horarios de ${localName.charAt(0).toUpperCase() + localName.slice(1)} actualizados correctamente`);
    } catch (error) {
      console.error("Error al guardar horarios:", error);
      alert("Error al guardar los horarios");
    } finally {
      setSavingSchedule(null);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {localsData.map((local) => {
            const schedule = editedSchedules[local.name];

            return (
              <div
                key={local.id}
                className="bg-[#2D2D2D] rounded-lg shadow-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-all flex flex-col"
              >
                {/* Nombre del local */}
                <h2 className="text-2xl font-bold text-white text-center mb-3">
                  {local.name.charAt(0).toUpperCase() + local.name.slice(1)}
                </h2>

                {/* Estado actual */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-gray-300 font-medium">Estado:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-sm ${
                      local.is_open === 1
                        ? "bg-green-600 text-white"
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
                  className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all mb-4 ${
                    updatingLocal === local.name
                      ? "bg-gray-500 cursor-not-allowed"
                      : local.is_open === 1
                      ? "bg-red-700 hover:bg-red-800 text-white"
                      : "bg-green-700 hover:bg-green-800 text-white"
                  }`}
                >
                  {updatingLocal === local.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Actualizando...
                    </span>
                  ) : local.is_open === 1 ? (
                    "Cerrar local"
                  ) : (
                    "Abrir local"
                  )}
                </button>

                {/* Horarios section */}
                <div className="border-t border-gray-600 pt-3">
                  <button
                    onClick={() => toggleHorarios(local.name)}
                    className="w-full flex items-center justify-center gap-2 text-white font-semibold text-lg hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Horarios
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        expandedHorarios[local.name] ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedHorarios[local.name] && schedule && (
                    <div className="mt-4 space-y-4">
                      {DAYS.map((day, dayIndex) => {
                        const dayKey = String(dayIndex);
                        const turns = schedule[dayKey];
                        const isClosed = turns === null;
                        const turn1 = turns?.[0] || { apertura: "", cierre: "" };
                        const turn2 = turns?.[1] || { apertura: "", cierre: "" };

                        return (
                          <div key={day}>
                            {/* Turno 1 */}
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-semibold text-sm w-24 shrink-0">
                                {day}
                              </span>
                              {isClosed ? (
                                <span className="bg-red-900/50 text-red-300 text-sm rounded px-3 py-1 border border-red-700 min-w-[120px] text-center">
                                  Cerrado
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={turn1.apertura}
                                    onChange={(e) => handleTimeChange(local.name, dayIndex, 0, "apertura", e.target.value)}
                                    className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-gray-400 w-[100px]"
                                  />
                                  <span className="text-gray-400 text-sm">/</span>
                                  <input
                                    type="time"
                                    value={turn1.cierre}
                                    onChange={(e) => handleTimeChange(local.name, dayIndex, 0, "cierre", e.target.value)}
                                    className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-gray-400 w-[100px]"
                                  />
                                </div>
                              )}
                              <button
                                onClick={() => handleToggleDayClosed(local.name, dayIndex)}
                                className={`shrink-0 p-1 rounded transition-colors ${
                                  isClosed
                                    ? "text-green-400 hover:text-green-300 hover:bg-green-900/30"
                                    : "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                }`}
                                title={isClosed ? "Abrir este día" : "Cerrar este día"}
                              >
                                {isClosed ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                            </div>

                            {/* Turno 2 */}
                            {!isClosed && (
                              <div className="flex items-center gap-2">
                                <span className="w-24 shrink-0"></span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="time"
                                    value={turn2.apertura}
                                    onChange={(e) => handleTimeChange(local.name, dayIndex, 1, "apertura", e.target.value)}
                                    className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-gray-400 w-[100px]"
                                  />
                                  <span className="text-gray-400 text-sm">/</span>
                                  <input
                                    type="time"
                                    value={turn2.cierre}
                                    onChange={(e) => handleTimeChange(local.name, dayIndex, 1, "cierre", e.target.value)}
                                    className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-gray-400 w-[100px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Botón Guardar */}
                      <button
                        onClick={() => handleSaveSchedule(local.name)}
                        disabled={savingSchedule === local.name}
                        className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all mt-4 ${
                          savingSchedule === local.name
                            ? "bg-gray-500 cursor-not-allowed text-gray-300"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {savingSchedule === local.name ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Guardando...
                          </span>
                        ) : (
                          "Guardar horarios"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
