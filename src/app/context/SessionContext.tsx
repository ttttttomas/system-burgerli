"use client";
import {createContext, useContext, useEffect, useState} from "react";

import useAuth from "@/app/hooks/useAuth";
import {SessionUser} from "@/types";
import { toast } from "sonner";

type LoginResult = {id: string};

type Ctx = {
  session: SessionUser | null;
  loading: boolean;
  locals: () => Promise<any>;
  OrdersToAddLocalStorage: () => Promise<void>;
  logoutUser: () => Promise<void>;
  loginUser: (username: string, password: string) => Promise<LoginResult>;
};

export const SessionContext = createContext<Ctx | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);

  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");

  return ctx;
}

export function SessionContextProvider({children}: {children: React.ReactNode}) {
  const {login,getLocals , verifyCookie, getOrdersWithConfirmed ,logout} = useAuth();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Iniciar en true para mostrar loading inicial

  const logoutUser = async () => {
    setLoading(true);
    try {
      // 1. Llamar al endpoint del backend para borrar la cookie del servidor
      await logout();
      
      // 2. Llamar al endpoint de Next.js para borrar cookies del lado del cliente
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.warn("⚠️ No se pudo llamar al endpoint de logout de Next.js");
      }
      
      // 3. Limpiar la sesión del contexto
      setSession(null);
      console.log("✅ Sesión cerrada correctamente");
      toast.success("Sesión cerrada correctamente");
      
      // 4. Esperar un momento antes de continuar
      await new Promise((resolve) => setTimeout(resolve, 150));
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Aún así limpiar la sesión local
      setSession(null);
      toast.error("Error al cerrar sesión, pero se limpió localmente.");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si hay un usuario iniciado
  const checkAuthentication = async () => {
    try {
      const response = await verifyCookie();

      if (response && response.status === 200 && response.data) {
        const userData = response.data;

        const newSession = {
          id: String(userData.id),
          local: String(userData.local),
          username: String(userData.username),
          rol: String(userData.rol),
        };

        setSession(newSession);
      } else {
        // Si no hay cookie válida, limpiar la sesión
        setSession(null);
      }
    } catch (error) {
      console.error("Error verificando cookie:", error);
      setSession(null);
    }
  };

  const loginUser = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await login({username, password});

      // if (res.status !== 200) throw new Error("Credenciales inválidas");
      if (res.status === 200) {
        // Después de login exitoso, verificar la cookie para actualizar la sesión
        await checkAuthentication();

        return res.data;
      }
    } finally {
      setLoading(false);
    }
  };

  const OrdersToAddLocalStorage = async () => {
      const orders = await getOrdersWithConfirmed(session?.local);
      console.log(orders);
      
      localStorage.setItem(`newOrders_${session?.local}`, JSON.stringify(orders));
      
  };  

  const locals = async () => {
    const locals = await getLocals();
    return locals.locals;
  }

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await checkAuthentication();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Cargar órdenes confirmadas cuando la sesión esté lista
  useEffect(() => {
    const loadConfirmedOrders = async () => {
      if (session?.local) {
        try {
          const orders = await getOrdersWithConfirmed(session.local);
          if (orders && orders.length > 0) {
            console.log("📦 Órdenes confirmadas cargadas:", orders);
            localStorage.setItem(`newOrders_${session.local}`, JSON.stringify(orders));
            
            // Disparar un evento personalizado para notificar al OrdersContext
            window.dispatchEvent(new CustomEvent('ordersUpdated', { 
              detail: { local: session.local } 
            }));
          }
        } catch (error) {
          console.error("❌ Error cargando órdenes confirmadas:", error);
        }
      }
    };

    loadConfirmedOrders();
  }, [session?.local]);



  return (
    <SessionContext.Provider value={{session,locals , OrdersToAddLocalStorage, logoutUser, loginUser, loading}}>
      {children}
    </SessionContext.Provider>
  );
}
