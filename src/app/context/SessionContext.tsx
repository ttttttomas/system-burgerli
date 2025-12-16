"use client";
import {createContext, useContext, useEffect, useState} from "react";

import useAuth from "@/app/hooks/useAuth";
import {SessionUser} from "@/types";

type LoginResult = {id: string};

type Ctx = {
  session: SessionUser | null;
  loading: boolean;
  loginUser: (username: string, password: string) => Promise<LoginResult>;
};

export const SessionContext = createContext<Ctx | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);

  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");

  return ctx;
}

export function SessionContextProvider({children}: {children: React.ReactNode}) {
  const {login, verifyCookie} = useAuth();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Iniciar en true para mostrar loading inicial

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
        console.log("Sesión verificada:", newSession);
        console.log("Asi queda la sesion del contexto: ", session);
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

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await checkAuthentication();
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <SessionContext.Provider value={{session, loginUser, loading}}>
      {children}
    </SessionContext.Provider>
  );
}
