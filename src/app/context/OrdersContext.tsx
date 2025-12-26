"use client";
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { Orders } from "@/types";
import { toast } from "sonner";
import { useSession } from "./SessionContext";

interface OrdersContextType {
  newOrders: Orders[];
  ordersInPreparation: Orders[];
  ordersReady: Orders[];
  audioEnabled: boolean;
  showAudioBanner: boolean;
  isLoaded: boolean;
  moveToPreparation: (orderId: string) => void;
  moveToReady: (orderId: string) => void;
  markAsDelivered: (orderId: string) => void;
  cancelOrder: (orderId: string, orderState: "new" | "preparation" | "ready") => Promise<void>;
  enableAudioNotifications: () => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders debe usarse dentro de <OrdersContextProvider>");
  return ctx;
}

export function OrdersContextProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [newOrders, setNewOrders] = useState<Orders[]>([]);
  const [ordersInPreparation, setOrdersInPreparation] = useState<Orders[]>([]);
  const [ordersReady, setOrdersReady] = useState<Orders[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAudioBanner, setShowAudioBanner] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);
  const previousOrderCountRef = useRef<number>(0);

  // Verificar si el audio ya fue habilitado previamente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audioWasEnabled = localStorage.getItem("audioNotificationsEnabled");
      if (audioWasEnabled === "true") {
        setAudioEnabled(true);
        setShowAudioBanner(false);
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
    if (isLoaded && audioEnabled && newOrders.length > previousOrderCountRef.current) {
      console.log("🎵 Intentando reproducir audio...");
      
      const audio = audioRef.current || new Audio('/notification-sound.mp3');
      audio.volume = 1.0;
      audio.currentTime = 0;
      
      audio.play()
        .then(() => {
          console.log("✅ Audio reproducido exitosamente");
        })
        .catch((error) => {
          console.error("❌ Error al reproducir audio:", error);
          setShowAudioBanner(true);
          setAudioEnabled(false);
        });
    }
    
    previousOrderCountRef.current = newOrders.length;
  }, [newOrders, isLoaded, audioEnabled]);

  // Función para cargar órdenes desde localStorage
  const loadOrdersFromLocalStorage = () => {
    if (typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();

      const savedNewOrders = localStorage.getItem(`newOrders_${localKey}`);
      if (savedNewOrders) {
        try {
          const parsed = JSON.parse(savedNewOrders);
          setNewOrders(parsed);
          console.log("✅ Órdenes nuevas cargadas desde localStorage:", parsed.length);
        } catch (e) {
          console.error("❌ Error al parsear newOrders desde localStorage:", e);
        }
      }

      const savedOrdersInPrep = localStorage.getItem(`ordersInPreparation_${localKey}`);
      if (savedOrdersInPrep) {
        try {
          const parsed = JSON.parse(savedOrdersInPrep);
          setOrdersInPreparation(parsed);
        } catch (e) {
          console.error("❌ Error al parsear ordersInPreparation desde localStorage:", e);
        }
      }

      const savedOrdersReady = localStorage.getItem(`ordersReady_${localKey}`);
      if (savedOrdersReady) {
        try {
          const parsed = JSON.parse(savedOrdersReady);
          setOrdersReady(parsed);
        } catch (e) {
          console.error("❌ Error al parsear ordersReady desde localStorage:", e);
        }
      }

      setIsLoaded(true);
    }
  };

  // Cargar órdenes desde localStorage al montar el componente
  useEffect(() => {
    loadOrdersFromLocalStorage();
  }, [session?.local]);

  // Escuchar evento personalizado para recargar órdenes
  useEffect(() => {
    const handleOrdersUpdated = (event: CustomEvent) => {
      console.log("🔄 Evento ordersUpdated recibido, recargando órdenes...");
      loadOrdersFromLocalStorage();
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdated as EventListener);

    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdated as EventListener);
    };
  }, [session?.local]);

  // Guardar en localStorage cada vez que cambien los estados
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();
      localStorage.setItem(`newOrders_${localKey}`, JSON.stringify(newOrders));
    }
  }, [newOrders, isLoaded, session?.local]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();
      localStorage.setItem(`ordersInPreparation_${localKey}`, JSON.stringify(ordersInPreparation));
    }
  }, [ordersInPreparation, isLoaded, session?.local]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined" && session?.local) {
      const localKey = session.local.toLowerCase();
      localStorage.setItem(`ordersReady_${localKey}`, JSON.stringify(ordersReady));
    }
  }, [ordersReady, isLoaded, session?.local]);

  // Función para mover una orden a "En preparación"
  const moveToPreparation = (orderId: string) => {
    const orderToMove = newOrders.find((order) => order.id_order === orderId);

    if (orderToMove) {
      const newStatus = "in_preparation";

      setOrdersInPreparation((prev) => [
        ...prev,
        { ...orderToMove, status: newStatus },
      ]);

      setNewOrders((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );

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
    const orderToMove = ordersInPreparation.find(
      (order) => order.id_order === orderId,
    );

    if (orderToMove) {
      const newStatus = "on_the_way";

      setOrdersReady((prev) => [
        ...prev,
        { ...orderToMove, status: newStatus },
      ]);

      setOrdersInPreparation((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );

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

  // Función para marcar una orden como entregada
  const markAsDelivered = (orderId: string) => {
    const orderToDeliver = ordersReady.find(
      (order) => order.id_order === orderId,
    );

    if (orderToDeliver) {
      const newStatus = "delivered";

      setOrdersReady((prev) =>
        prev.filter((order) => order.id_order !== orderId),
      );

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
    try {
      // Eliminar de la base de datos
      const response = await fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/deleteOrder/${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el pedido");
      }

      // Remover del estado correspondiente
      switch (orderState) {
        case "new":
          setNewOrders((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          break;
        case "preparation":
          setOrdersInPreparation((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          break;
        case "ready":
          setOrdersReady((prev) =>
            prev.filter((order) => order.id_order !== orderId),
          );
          break;
      }

      // Enviar notificación por WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: "order_cancelled",
            order_id: orderId,
            local: session?.local,
          }),
        );
      }

      toast.success("Pedido cancelado exitosamente");
    } catch (error) {
      console.error("❌ Error al cancelar orden:", error);
      toast.error("Error al cancelar el pedido");
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!session || !session.local) {
      return;
    }

    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("⚠️ Ya existe una conexión WebSocket activa");
        return;
      }

      console.log("🔌 Intentando conectar WebSocket...");
      const ws = new WebSocket(`wss://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/ws/orders`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conexión establecida con el servidor WebSocket");
        ws.send(JSON.stringify({ event: "identify", type: "dashboard" }));
      };

      ws.onerror = (error) => {
        console.error("❌ Error en la conexión WebSocket:", error);
      };

      ws.onmessage = function (event) {
        try {
          const msg = JSON.parse(event.data);

          if (msg.event === "new_order") {
            const pedidoLocal = msg.pedido?.local?.toLowerCase();
            const sessionLocal = session?.local?.toLowerCase();

            if (pedidoLocal === sessionLocal) {
              toast.success("Pedido agregado exitosamente");
              setNewOrders((prevOrders) => [
                ...prevOrders,
                { ...msg.pedido, status: "Nuevo" },
              ]);
            }
          } else if (msg.event === "status_update") {
            const { order_id, status, local } = msg;
            const orderLocal = local?.toLowerCase();
            const sessionLocal = session?.local?.toLowerCase();

            if (orderLocal === sessionLocal) {
              console.log("✅ Actualizando estado de orden:", order_id, "→", status);

              switch (status) {
                case "En preparación":
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
                  setOrdersReady((prev) =>
                    prev.filter((o) => o.id_order !== order_id),
                  );
                  break;
              }
            }
          }
        } catch (e) {
          console.error("❌ Error procesando mensaje:", e);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 Conexión WebSocket cerrada. Código:", event.code);
        wsRef.current = null;

        if (shouldReconnectRef.current) {
          console.log("🔄 Reconectando en 3 segundos...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };
    };

    shouldReconnectRef.current = true;
    connectWebSocket();

    return () => {
      console.log("🧹 Limpiando conexión WebSocket...");
      shouldReconnectRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

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
  }, [session]);

  return (
    <OrdersContext.Provider
      value={{
        newOrders,
        ordersInPreparation,
        ordersReady,
        audioEnabled,
        showAudioBanner,
        isLoaded,
        moveToPreparation,
        moveToReady,
        markAsDelivered,
        cancelOrder,
        enableAudioNotifications,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}
