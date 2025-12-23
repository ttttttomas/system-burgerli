"use client";
import {useSession} from "../context/SessionContext";
import { useEffect, useState } from "react";
import { Orders } from "@/types";
import Cruz from "../components/Cruz";
import { parseLineItems } from "@/lib/ProductsToJson";
import TicketPrintButton from "../components/TicketPrinterButton";
import PopupOrders from "../components/PopupOrders";
import { useOrders } from "../context/OrdersContext";


export default function OrderPages() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Orders[]>([]);
  const {session} = useSession();
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);
  const { newOrders, moveToPreparation, cancelOrder } = useOrders();

  

  const openModal = (order: Orders) => {
    setSelectedOrder(order);

  };

  const handleClick = () => {
    setSelectedOrder(null);
  };
  
  
  const filteredData = (data: Orders[]) => {
    return data.filter((item) => item.local.toLowerCase() === session?.local && item.status === "delivered");
  };
  
  useEffect(() => {
    const local = session?.local;
    console.log("local", local);
    if (local) {
      fetch(`https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrders`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(filteredData(data));
        setLoading(false);
      });
    }
  }, [session]);
  
  if (loading) {
    return <div className="mr-8 ml-80 flex flex-col justify-start gap-5 text-black">Loading...</div>;
  }
  
  const obj = orders.length > 0 ? parseLineItems(orders[0].products) : [];
  console.log(obj);
  
  return (
    <main className="mr-8 ml-80 flex flex-col justify-start gap-5 text-black">
      <PopupOrders
        orders={newOrders}
        onMoveToPreparation={moveToPreparation}
        onCancelOrder={(orderId: string) => cancelOrder(orderId, "new")}
      />
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
              {["ID", "Cliente", "Local", "Metodo de pago", "Estado", "Más detalles"].map(
                (header, i) => (
                  <th key={i} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      {/* {i < 5 && <ArrowUpDown className="h-4 w-4" />} */}
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
                className="border-t border-[#d9cbb3] transition-colors"
              >
                <td className="px-4 py-2">{row.id_order?.slice(0,10) + "..."}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.local}</td>
                <td className="px-4 py-2">{row.payment_method === "account_money" ? "Mercado Pago" : "Efectivo"}</td>
                <td className="px-4 py-2">Entregado</td>
                <td className="px-4 py-2 font-semibold text-[#3f2e1f]">
                  <button onClick={() => openModal(row)} className="cursor-pointer  hover:underline">Más detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {selectedOrder &&
       <aside className="fixed top-0 right-0 z-40 flex h-full flex-col gap-5 bg-[#FCEDCC] text-black shadow-xl shadow-black/40 transition-all duration-300">
                <div className="flex items-center justify-between bg-green-500 px-5 py-3">
                  <p className="text-md text-center font-bold text-black">
                    Pedido entregado
                  </p>
                  <div className="cursor-pointer" onClick={handleClick}>
                    <Cruz />
                  </div>
                </div>
                <section className="flex flex-col gap-1 px-5">
                  <h1 className="text-center text-2xl font-bold">
                    Detalles del pedido
                  </h1>
                  <p className="text-center">
                    (#{selectedOrder.id_order?.slice(0, 10)})
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <p>{new Date().toLocaleDateString()}</p>
                    <p>{new Date().toLocaleTimeString()}</p>
                  </div>
                  <h2 className="text-center font-bold underline">
                    Datos del cliente
                  </h2>
                  <ul className="flex flex-col gap-1">
                    <li>
                      Nombre: <b>{selectedOrder.name}</b>
                    </li>
                    <li>
                      Mail: <b>{selectedOrder.email}</b>
                    </li>
                    <li>
                      Telefono: <b>{selectedOrder.phone}</b>
                    </li>
                    {selectedOrder.address && (
                      <li>
                        Direccion: <b>{selectedOrder.address}</b>
                      </li>
                    )}
                  </ul>
                  <h2 className="text-center font-bold underline">
                    Forma de entrega
                  </h2>
                  <p>{selectedOrder.delivery_mode === "pickup" ? 'Retiro en local' : 'Delivery'}</p>
                  <h3 className="text-center font-bold underline my-2">Pedido</h3>
                  <ul className="flex flex-col gap-5">
                    {selectedOrder.products && selectedOrder.products.length > 0 ? (
                      obj.map((product, index) => (
                        <li key={index} className="flex justify-between gap-5">
                          <b>{product.quantity}x</b>
                          <ul>
                            <li className="font-bold">{product.name}</li>
                            <li className="text-sm">Tamaño: {product.size}</li>
                            <li className="text-sm">Papas: {product.fries}</li>
                          </ul>
                          <small>${product.price.toLocaleString()}</small>
                        </li>
                      ))
                    ) : (
                      <li>No hay productos</li>
                    )}
                  </ul>
                  <div className="my-2 flex items-center justify-between text-lg">
                    <b>Total</b>
                    <b>${selectedOrder.price.toLocaleString()}</b>
                  </div>
                  <b>
                    Pago: 
                    {selectedOrder.payment_method === "Efectivo"
                      ? " Efectivo"
                      : " Mercado Pago"}
                  </b>
                  {selectedOrder.order_notes && (
                    <>
                      <h3 className="my-5 text-center font-bold underline">
                        Notas del cliente
                      </h3>
                      <p>{selectedOrder.order_notes}</p>
                    </>
                  )}
                  <div className="flex flex-col gap-5 my-1">
                    <TicketPrintButton order={selectedOrder} />
                  </div>
                </section>
              </aside>}
    </main>
  );
}
