import type { Metadata } from "next";

import { Roboto } from "next/font/google";

import "./globals.css";
import { SessionContextProvider } from "@/app/context/SessionContext";
import { OrdersContextProvider } from "@/app/context/OrdersContext";
import { Toaster } from "sonner";

import Aside from "./components/Aside";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
// const inter = Inter({subsets: ["latin"], weight: "400"});

export const metadata: Metadata = {
  title: "Burgerli - sistema de gestionamiento",
  description: "Sistema de gestionamiento para Burgerli",
  authors: [{ name: "Burgerli" }],  
  icons: {
    icon: "logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <SessionContextProvider>
        <OrdersContextProvider>
          <body className={`${roboto.className} h-full bg-white antialiased`}>
            <Toaster position="top-center" richColors />
            <Aside />
            <div className="lg:pl-0">
              {children}
            </div>
          </body>
        </OrdersContextProvider>
      </SessionContextProvider>
    </html>
  );
}
