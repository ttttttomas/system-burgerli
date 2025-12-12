"use client";
import {ArrowUpDown} from "lucide-react";

import {useSession} from "../context/SessionContext";
import Lupa from "../components/Lupa";
import { useEffect, useState } from "react";
import { Orders } from "@/types";

export default function OrderPages() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Orders[]>([]);
  const {session} = useSession();

  const filteredData = (data: Orders[]) => {
    return data.filter((item) => item.local.toLowerCase() === session?.local && item.status === "delivered");
  };

  useEffect(() => {
    const local = session?.local;
    console.log("local", local);
    if (local) {
      fetch(`http://localhost:8000/getOrders`)
        .then((res) => res.json())
        .then((data) => {
          console.log("data", data);
          setOrders(filteredData(data));
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return <div className="mr-8 ml-80 flex flex-col justify-start gap-5 text-black">Loading...</div>;
  }

  return (
    <main className="mr-8 ml-80 flex flex-col justify-start gap-5 text-black">
      <h1 className="pt-5 text-2xl font-bold">Historial de pedidos - {session?.local}</h1>
      {/* <section className="flex items-center justify-start gap-20">
        <div className="flex w-max items-center gap-2 rounded-xl bg-[#EEAA4B] p-2">
          <Lupa />
          <input className="font-bold" placeholder="Buscar por ID" type="text" />
        </div>
        <div className="flex w-max items-center gap-2 rounded-xl bg-[#EEAA4B] p-2">
          <Lupa />
          <input className="font-bold" placeholder="Buscar por cliente" type="text" />
        </div>
        <div className="flex w-max items-center gap-2 rounded-xl bg-[#EEAA4B] p-2">
          <Lupa />
          <input className="font-bold" placeholder="Buscar por fecha" type="text" />
        </div>
      </section> */}
      <section className="w-full">
        <table className="w-full table-auto border-collapse rounded-md">
          <thead className="bg-[#3f2e1f] text-white">
            <tr>
              {["ID", "Cliente", "Fecha", "Metodo de pago", "Estado", "Más detalles"].map(
                (header, i) => (
                  <th key={i} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      {i < 5 && <ArrowUpDown className="h-4 w-4" />}
                    </div>
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="bg-[#f5e6c8] text-sm text-black">
            {orders.map((row, i) => (
              <tr
                key={i}
                className="border-t border-[#d9cbb3] transition-colors hover:bg-[#f3dbc0]"
              >
                <td className="px-4 py-2">{row.id_order?.slice(0,10) + "..."}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.local}</td>
                <td className="px-4 py-2">{row.payment_method}</td>
                <td className="px-4 py-2">Entregado</td>
                <td className="cursor-pointer px-4 py-2 font-semibold text-[#3f2e1f] hover:underline">
                  Más detalles
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
