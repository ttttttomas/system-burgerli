"use client";
import { useState, useEffect, useRef } from "react";

import OrderCard from "../components/OrderCard";
import OrderReadyCard from "../components/OrderReadyCard";
import PopupOrders from "../components/PopupOrders";
import { useSession } from "../context/SessionContext";
import useAuth from "../hooks/useAuth";

import { Orders } from "@/types";
import { toast } from "sonner";

export default function HomePage() {
  const { session } = useSession();
  const { deleteOrder } = useAuth();
  const [newOrders, setNewOrders] = useState<Orders[]>([]); // Órdenes nuevas
  const [ordersInPreparation, setOrdersInPreparation] = useState<Orders[]>([]); // En preparación
  const [ordersReady, setOrdersReady] = useState<Orders[]>([]); // Listas para retirar
  const [isLoaded, setIsLoaded] = useState(false); // Para controlar la carga inicial
  const [audioEnabled, setAudioEnabled] = useState(false); // Para controlar si el audio está habilitado
  const [showAudioBanner, setShowAudioBanner] = useState(true); // Para mostrar el banner
  const audioRef = useRef<HTMLAudioElement | null>(null); // Referencia al elemento de audio
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);
  const previousOrderCountRef = useRef<number>(0); // Para rastrear la cantidad anterior de pedidos

  // Verificar si el audio ya fue habilitado previamente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audioWasEnabled = localStorage.getItem("audioNotificationsEnabled");
      if (audioWasEnabled === "true") {
        setAudioEnabled(true);
        setShowAudioBanner(false);
        // Precargar el audio
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 1.0;
        audioRef.current = audio;
        console.log("✅ Audio precargado desde localStorage");
      }
    }
  }, []);

  // Función para habilitar el audio con interacción del usuario
  const enableAudioNotifications = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 1.0;
    
    // Reproducir y pausar inmediatamente para "desbloquear" el audio
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioRef.current = audio;
        setAudioEnabled(true);
        setShowAudioBanner(false);
        localStorage.setItem("audioNotificationsEnabled", "true");
        console.log("✅ Notificaciones de audio habilitadas");
        toast.success("Notificaciones de sonido activadas");
      })
      .catch((error) => {
        console.error("❌ Error al habilitar audio:", error);
        toast.error("No se pudo activar el sonido");
      });
  };
  
  // Efecto para reproducir sonido cuando llega un nuevo pedido
  useEffect(() => {    
    // Solo reproducir si hay más pedidos que antes, no es la carga inicial, y el audio está habilitado
    if (isLoaded && audioEnabled && newOrders.length > previousOrderCountRef.current) {
      
      console.log("🎵 Intentando reproducir audio...");
      
      // Usar el audio precargado o crear uno nuevo
      const audio = audioRef.current || new Audio('/notification-sound.mp3');
      audio.volume = 1.0;
      audio.currentTime = 0; // Reiniciar al inicio
      
      audio.play()
        .then(() => {
          console.log("✅ Audio reproducido exitosamente");
        })
        .catch((error) => {
          console.error("❌ Error al reproducir audio:", error);
          console.error("   - Mensaje:", error.message);
          // Si falla, mostrar el banner nuevamente
          setShowAudioBanner(true);
          setAudioEnabled(false);
        });
    } else {
      console.log("⏭️ No se reproduce sonido:");
      if (!isLoaded) console.log("   - Razón: isLoaded es false (carga inicial)");
      if (!audioEnabled) console.log("   - Razón: Audio no habilitado");
      if (newOrders.length <= previousOrderCountRef.current) {
        console.log("   - Razón: No hay incremento en pedidos");
        console.log("   - Anterior:", previousOrderCountRef.current, "| Actual:", newOrders.length);
      }
    }
    
    // Actualizar el contador de pedidos anterior
    previousOrderCountRef.current = newOrders.length;
  }, [newOrders, isLoaded, audioEnabled]);

  // Cargar órdenes desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();

      // Cargar órdenes nuevas
      const savedNewOrders = localStorage.getItem(`newOrders_${localKey}`);

      if (savedNewOrders) {
        try {
          const parsed = JSON.parse(savedNewOrders);

          setNewOrders(parsed);
        } catch (e) {
          console.error("❌ Error al parsear newOrders desde localStorage:", e);
        }
      }

      // Cargar órdenes en preparación
      const savedOrdersInPrep = localStorage.getItem(
        `ordersInPreparation_${localKey}`,
      );

      if (savedOrdersInPrep) {
        try {
          const parsed = JSON.parse(savedOrdersInPrep);

          setOrdersInPreparation(parsed);
          // console.log(
          //   "📦 Órdenes en preparación cargadas desde localStorage:",
          //   parsed,
          // );
        } catch (e) {
          // console.error(
          //   "❌ Error al parsear ordersInPreparation desde localStorage:",
          //   e,
          // );
        }
      }

      // Cargar órdenes listas para retirar
      const savedOrdersReady = localStorage.getItem(`ordersReady_${localKey}`);

      if (savedOrdersReady) {
        try {
          const parsed = JSON.parse(savedOrdersReady);

          setOrdersReady(parsed);
          // console.log("📦 Órdenes listas cargadas desde localStorage:", parsed);
        } catch (e) {
          // console.error(
          //   "❌ Error al parsear ordersReady desde localStorage:",
          //   e,
          // );
        }
      }

      setIsLoaded(true);
    }
  }, [session?.local]);

  // Guardar newOrders en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();

      localStorage.setItem(`newOrders_${localKey}`, JSON.stringify(newOrders));
      // console.log("💾 Órdenes nuevas guardadas en localStorage");
    }
  }, [newOrders, isLoaded, session?.local]);

  // Guardar ordersInPreparation en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();

      localStorage.setItem(
        `ordersInPreparation_${localKey}`,
        JSON.stringify(ordersInPreparation),
      );
      // console.log("💾 Órdenes en preparación guardadas en localStorage");
    }
  }, [ordersInPreparation, isLoaded, session?.local]);

  // Guardar ordersReady en localStorage cada vez que cambien
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();

      localStorage.setItem(
        `ordersReady_${localKey}`,
        JSON.stringify(ordersReady),
      );
      // console.log("💾 Órdenes listas guardadas en localStorage");
    }
  }, [ordersReady, isLoaded, session?.local]);

  // Función para mover una orden a "En preparación"
  const moveToPreparation = (orderId: string) => {
    // console.log("🟦 Moviendo orden a preparación:", orderId);

    // Buscar la orden en newOrders
    const orderToMove = newOrders.find((order) => order.id_order === orderId);

    if (orderToMove) {
      const newStatus = "in_preparation";

      // Agregar a ordersInPreparation
      setOrdersInPreparation((prev) => [
        ...prev,
        { ...orderToMove, status: newStatus },
      ]);

      // Remover de newOrders
      setNewOrders((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );

      // Enviar actualización de estado por API (PATCH)
      fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `Error HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ Estado actualizado vía PATCH:", data);
        })
        .catch((error) => {
          console.error("❌ Error actualizando estado vía PATCH:", error);
        });
    }
  };

  // Función para mover una orden a "Listo para retirar"
  const moveToReady = (orderId: string) => {
    // console.log("🔄 Moviendo orden a listo para retirar:", orderId);

    // Buscar la orden en ordersInPreparation
    const orderToMove = ordersInPreparation.find(
      (order) => order.id_order === orderId,
    );

    if (orderToMove) {
      const newStatus = "on_the_way";

      // Agregar a ordersReady
      setOrdersReady((prev) => [
        ...prev,
        { ...orderToMove, status: newStatus },
      ]);

      // Remover de ordersInPreparation
      setOrdersInPreparation((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );
      // Enviar actualización de estado por API (PATCH)
      fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `Error HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ Estado actualizado vía PATCH:", data);
        })
        .catch((error) => {
          console.error("❌ Error actualizando estado vía PATCH:", error);
        });
    }
  };

  // Función para marcar una orden como entregada (eliminarla)
  const markAsDelivered = (orderId: string) => {
    // console.log("✅ Marcando orden como entregada:", orderId);

    // Buscar la orden en ordersReady
    const orderToDeliver = ordersReady.find(
      (order) => order.id_order === orderId,
    );

    if (orderToDeliver) {
      const newStatus = "delivered";

      // Remover de ordersReady
      setOrdersReady((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );

      // Enviar actualización de estado por API (PATCH)
      fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || `Error HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("✅ Estado actualizado vía PATCH:", data);
        })
        .catch((error) => {
          console.error("❌ Error actualizando estado vía PATCH:", error);
        });
    }
  };

  // Función para cancelar una orden desde cualquier estado
  const cancelOrder = async (
    orderId: string,
    orderState: "new" | "preparation" | "ready",
  ) => {
    // console.log("🗑️ Cancelando orden:", orderId, "desde estado:", orderState);

    try {
      // 1. Eliminar de la base de datos
      await deleteOrder(orderId);

      // 2. Remover del estado correspondiente (esto automáticamente actualiza localStorage)
      switch (orderState) {
        case "new":
          setNewOrders((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          // console.log("✅ Orden removida de newOrders");
          break;
        case "preparation":
          setOrdersInPreparation((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          // console.log("✅ Orden removida de ordersInPreparation");
          break;
        case "ready":
          setOrdersReady((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          // console.log("✅ Orden removida de ordersReady");
          break;
      }

      // 3. Enviar notificación por WebSocket para que el cliente sepa que se canceló
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: "order_cancelled",
            order_id: orderId,
            local: session?.local,
          }),
        );
        // console.log("📤 Notificación de cancelación enviada por WebSocket");
      }

      toast.success("Pedido cancelado exitosamente");
      // console.log("✅ Orden cancelada completamente");
    } catch (error) {
      console.error("❌ Error al cancelar orden:", error);
      toast.error("Error al cancelar el pedido");
    }
  };

  useEffect(() => {
    // No crear la conexión si la sesión aún no está disponible
    if (!session || !session.local) {
      // console.log("⏳ Esperando sesión... session:", session);

      return;
    }

    // console.log("🔐 Sesión disponible - Local:", session.local);

    // Función para conectar/reconectar el WebSocket
    const connectWebSocket = () => {
      // Si ya hay una conexión activa, no crear otra
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("⚠️ Ya existe una conexión WebSocket activa");

        return;
      }

      console.log("🔌 Intentando conectar WebSocket...");
      // const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL;
      
      // const ws = new WebSocket(`ws://localhost:8000/ws/orders`);
      const ws = new WebSocket(`wss://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/ws/orders`);

      // const ws = new WebSocket("wss://api-burgerli.iwebtecnology.com/api/ws/orders")

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conexión establecida con el servidor WebSocket");
        ws.send(JSON.stringify({ event: "identify", type: "dashboard" }));
        // console.log("📤 Identificado como dashboard en:", ws.url);
      };

      ws.onerror = (error) => {
        console.error("❌ Error en la conexión WebSocket:", error);
      };

      ws.onmessage = function (event) {
        try {
          const msg = JSON.parse(event.data);

          // console.log("📨 Mensaje recibido en dashboard:", msg);

          if (msg.event === "new_order") {
            const pedidoLocal = msg.pedido?.local?.toLowerCase();
            const sessionLocal = session?.local?.toLowerCase();

            // console.log(
            //   "🔍 Verificando local - Pedido:",
            //   pedidoLocal,
            //   "| Sesión:",
            //   sessionLocal,
            // );

            // Solo agregar la orden si el local coincide con el local de la sesión
            if (pedidoLocal === sessionLocal) {
              toast.success("Pedido agregado exitosamente");
              // console.log(
              //   "✅ Local coincide - Agregando pedido:",
              //   msg.pedido,
              //   "Cliente:",
              //   msg.user_id,
              // );
              // Agregar a newOrders (órdenes nuevas)
              setNewOrders((prevOrders) => [
                ...prevOrders,
                { ...msg.pedido, status: "Nuevo" },
              ]);
            } else {
              console.log(
                "⚠️ Local no coincide - Pedido ignorado. Pedido local:",
                pedidoLocal,
                "| Sesión local:",
                sessionLocal,
              );
            }
          } else if (msg.event === "status_update") {
            // console.log("🔄 Evento de actualización de estado recibido:", msg);

            const { order_id, status, local } = msg;
            const orderLocal = local?.toLowerCase();
            const sessionLocal = session?.local?.toLowerCase();

            
            // Solo procesar si es del mismo local
            if (orderLocal === sessionLocal) {
              console.log(
                "✅ Actualizando estado de orden:",
                order_id,
                "→",
                status,
              );

              // Actualizar el estado según el nuevo status
              switch (status) {
                case "En preparación":
                  // Mover de newOrders a ordersInPreparation
                  setNewOrders((prev) => {
                    const order = prev.find((o) => o.id_order === order_id);

                    if (order) {
                      setOrdersInPreparation((prep) => [
                        ...prep,
                        { ...order, status },
                      ]);

                      return prev.filter((o) => o.id_order !== order_id);
                    }

                    return prev;
                  });
                  break;

                case "Listo para retirar":
                  // Mover de ordersInPreparation a ordersReady
                  setOrdersInPreparation((prev) => {
                    const order = prev.find((o) => o.id_order === order_id);

                    if (order) {
                      setOrdersReady((ready) => [
                        ...ready,
                        { ...order, status },
                      ]);

                      return prev.filter((o) => o.id_order !== order_id);
                    }

                    return prev;
                  });
                  break;

                case "Entregado":
                  // Remover de ordersReady
                  setOrdersReady((prev) =>
                    prev.filter((o) => o.id_order !== order_id),
                  );
                  // console.log("✅ Orden marcada como entregada y eliminada");
                  break;

                default:
                  console.warn("⚠️ Estado desconocido:", status);
              }
            } else {
              console.log(
                "⚠️ Actualización de estado ignorada - Local diferente",
              );
            }
          }
        } catch (e) {
          console.error("❌ Error procesando mensaje:", e);
        }
      };

      ws.onclose = (event) => {
        console.log(
          "🔌 Conexión WebSocket cerrada. Código:",
          event.code,
          "Razón:",
          event.reason,
        );
        wsRef.current = null;

        // Intentar reconectar automáticamente si shouldReconnect es true
        if (shouldReconnectRef.current) {
          console.log("🔄 Reconectando en 3 segundos...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 0);
        }
      };
    };

    // Iniciar la conexión
    shouldReconnectRef.current = true;
    connectWebSocket();

    // Función de limpieza: cerrar el WebSocket cuando el componente se desmonte
    return () => {
      console.log("🧹 Limpiando conexión WebSocket...");
      shouldReconnectRef.current = false; // Desactivar reconexión automática

      // Limpiar timeout de reconexión si existe
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Cerrar la conexión WebSocket
      if (wsRef.current) {
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [session]); // Se ejecuta cuando session cambia

  return (
    <main className="ml-77 h-full font-bold text-black">
      {/* Banner para habilitar notificaciones de audio */}
      {showAudioBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-bold text-lg">Habilitar notificaciones de sonido</p>
                <p className="text-sm opacity-90">Haz clic aquí para recibir alertas sonoras cuando lleguen nuevos pedidos</p>
              </div>
            </div>
            <button
              onClick={enableAudioNotifications}
              className="bg-white text-orange-500 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors"
            >
              Activar Sonido
            </button>
          </div>
        </div>
      )}
      
      <PopupOrders
        orders={newOrders}
        onMoveToPreparation={moveToPreparation}
        onCancelOrder={(orderId: string) => cancelOrder(orderId, "new")}
      />
      <h2 className="pt-5 text-2xl font-bold">Pedidos en preparación</h2>
      {/* LISTA DE PEDIDOS EN PREPARACION*/}
      <section className="my-10 flex flex-wrap items-center justify-start gap-14">
        {ordersInPreparation.length > 0 ? (
          ordersInPreparation.map((order, index) => (
            <OrderCard
              key={order.id_order || index}
              order={order}
              onMoveToReady={moveToReady}
              onCancelOrder={(orderId: string) =>
                cancelOrder(orderId, "preparation")
              }
            />
          ))
        ) : (
          <p className="text-gray-500">No hay pedidos en preparación.</p>
        )}
      </section>
      <h2 className="text-2xl font-bold">Pedidos listos para retirar</h2>
      {/* LISTA DE PEDIDOS PARA RETIRAR */}
      <section className="my-10 flex items-center gap-10">
        {ordersReady.length > 0 ? (
          ordersReady.map((order, index) => (
            <OrderReadyCard
              key={order.id_order || index}
              order={order}
              onMarkAsDelivered={markAsDelivered}
              onCancelOrder={(orderId: string) => cancelOrder(orderId, "ready")}
            />
          ))
        ) : (
          <p className="text-gray-500">No hay pedidos listos para retirar.</p>
        )}
      </section>
      <footer>
        <h6 className="text-3xl">Datos de la sesión:</h6>
        <ul className="list-disc ml-10 flex flex-col gap-1">
          <li>Local: {session?.local}</li>
          <li>Usuario: {session?.username}</li>
          <li>Rol: {session?.rol === "employed" ? "Empleado" : "Administrador"}</li>
        </ul>
      </footer>
    </main>
  );
}
