// components/TicketPrintButton.tsx
"use client";

import { useRef, useState } from "react";
import type { Orders } from "@/types";
import { render } from "react-thermal-printer";
import { buildReceipt, TicketOrder } from "@/app/components/TicketPrinter";

interface Props {
  order: TicketOrder;
}

export default function TicketPrintButton({ order }: Props) {
  const portRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const connectPrinter = async () => {
    if (!("serial" in navigator)) {
      alert("Este navegador no soporta Web Serial API (Chrome/Edge desktop).");
      return;
    }

    try {
      // usuario elige el puerto de la impresora
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 }); // ajustá al baudrate de tu impresora
      portRef.current = port;
      setConnected(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar a la impresora.");
    }
  };

  const printTicket = async () => {
    if (!portRef.current) {
      await connectPrinter();
      if (!portRef.current) return;
    }

    setLoading(true);
    try {
      // 1) construir JSX del ticket
      const receipt = buildReceipt(order);

      // 2) convertir a ESC/POS bytes
      const data = await render(receipt); // Uint8Array

      // 3) escribir al puerto serie
      const writer = portRef.current.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();

      alert("Ticket enviado a la impresora.");
    } catch (err) {
      console.error(err);
      alert("Error al imprimir el ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={printTicket}
        className="rounded-xl border-2 cursor-pointer border-dashed border-[#EEAA4B] py-2 font-bold text-black"
        disabled={loading}
      >
        {loading ? "Imprimiendo..." : "Imprimir ticket"}
      </button>

      {!connected && (
        <button
          type="button"
          onClick={connectPrinter}
          className="px-3 py-2 rounded underline cursor-pointer border text-sm"
        >
          Conectar impresora
        </button>
      )}
    </div>
  );
}
