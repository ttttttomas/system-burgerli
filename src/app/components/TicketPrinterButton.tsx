"use client";

import { useRef, useState } from "react";
import { render } from "react-thermal-printer";
import { buildReceipt } from "@/app/components/TicketPrinter";
import { Orders } from "@/types";



export default function TicketPrintButton({ order }: { order: Orders }) {
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const connectPrinter = async () => {
    try {
      // Usamos 'acceptAllDevices' para que aparezca en la lista sí o sí
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "0000ff00-0000-1000-8000-00805f9b34fb", // El más común en impresoras térmicas
          "000018f0-0000-1000-8000-00805f9b34fb"  // Alternativo
        ]
      });
  
      const server = await device.gatt.connect();
      
      // Intentamos obtener el servicio primario
      const service = await server.getPrimaryService("0000ff00-0000-1000-8000-00805f9b34fb");
      const characteristic = await service.getCharacteristic("0000ff02-0000-1000-8000-00805f9b34fb");
  
      characteristicRef.current = characteristic;
      setConnected(true);
      alert("Conectado a: " + device.name);
    } catch (err) {
      console.error("Error conectando:", err);
      alert("Error de conexión. Revisa la consola.");
    }
  };
  const printTicket = async () => {
    if (!characteristicRef.current) {
      await connectPrinter();
      if (!characteristicRef.current) return;
    }

    setLoading(true);
    try {
      const receipt = buildReceipt(order);
      const data = await render(receipt);
  
      const chunkSize = 20; 
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        // Intentamos usar el método más rápido y compatible
        if (characteristicRef.current.writeValueWithoutResponse) {
          await characteristicRef.current.writeValueWithoutResponse(chunk);
        } else {
          await characteristicRef.current.writeValue(chunk);
        }
  
        // ESTO ES VITAL: Esperar 30ms entre paquetes para no saturar a la Global
        await new Promise(r => setTimeout(r, 30)); 
      }
  
      alert("¡Ticket impreso!");
    } catch (err) {
      console.error("Error al imprimir:", err);
      alert("Error de comunicación con la impresora.");
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
          Conectar impresora Bluetooth
        </button>
      )}
    </div>
  );
}