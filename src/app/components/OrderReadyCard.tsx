"use client";
import { useState } from "react";

import Cruz from "./Cruz";

import { Orders } from "@/types";
import { parseLineItems } from "@/lib/ProductsToJson";
import TicketPrintButton from "./TicketPrinterButton";
// import TicketPrintButton from "./TicketPrinterButton";

interface OrderReadyCardProps {
  order: Orders;
  onMarkAsDelivered: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function OrderReadyCard({
  order,
  onMarkAsDelivered,
  onCancelOrder,
}: OrderReadyCardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);

  const handleClick = () => {
    setSelectedOrder(null);
  };

  const openModal = (order: Orders) => {
    setSelectedOrder(order);
  };

  const handleMarkAsDelivered = () => {
    if (order.id_order) {
      onMarkAsDelivered(order.id_order);
      handleClick();
    }
  };

  const handleCancelOrder = () => {
    if (order.id_order) {
      onCancelOrder(order.id_order);
      handleClick();
    }
  };

  const productCount = order.products?.length || 0;

  const obj = parseLineItems(order.products);

  return (
    <>
      <section className="flex w-90 flex-col gap-3 rounded-xl bg-[#493D2E] px-5 pt-3 text-white shadow-lg shadow-black/50">
        <small>#{order.id_order?.slice(0, 7)}</small>
        <div className="flex items-center justify-between">
          <b className="text-lg">{order.name}</b>
          <p>Hace 5 minutos</p>
        </div>

        <small>
          {productCount} {productCount === 1 ? "producto" : "productos"}
        </small>

        <button
          className="mx-auto cursor-pointer rounded-t-xl border bg-white px-5 font-bold text-black"
          type="button"
          onClick={() => openModal(order)}
        >
          Ver detalles
        </button>
      </section>

      {selectedOrder && (
        <aside className="fixed top-0 right-0 z-40 flex h-full flex-col gap-5 bg-[#FCEDCC] text-black shadow-xl shadow-black/40 transition-all duration-300">
          <div className="flex items-center justify-between bg-[#EEAA4B] px-5 py-3">
            <p className="text-md bg-[#EEAA4B] text-center font-bold text-black">
              Listo para retirar
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
            <h3 className="text-center font-bold underline">Pedido</h3>
            <ul className="flex flex-col gap-1">
              {selectedOrder.products && selectedOrder.products.length > 0 ? (
                obj.map((product, index) => (
                  <li key={index} className="flex justify-between gap-5">
                    <b>{product.quantity}x</b>
                    <ul>
                      <li className="">{product.name}</li>
                      {product.selectedOptions && product.selectedOptions.length > 0 && (
                        <li className="text-sm">Opciones: {product.selectedOptions.join(", ")}</li>
                      )}
                      {product.size && <li className="text-sm">Tamaño: {product.size}</li>}
                      {product.fries && <li className="text-sm">Papas: {product.fries}</li>}
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
            <div className="flex flex-col gap-3">
              <button
                className="rounded-xl cursor-pointer text-black hover:bg-green-500/50 bg-green-500 transition-all py-2 font-bold"
                onClick={handleMarkAsDelivered}
              >
                ✓ Pedido entregado
              </button>
              <TicketPrintButton order={selectedOrder} />
              <button
                className="rounded-xl bg-red-500 py-2 font-bold text-white cursor-pointer hover:bg-red-600 transition-all"
                onClick={handleCancelOrder}
              >
                Cancelar pedido
              </button>
            </div>
          </section>
        </aside>
      )}
    </>
  );
}
