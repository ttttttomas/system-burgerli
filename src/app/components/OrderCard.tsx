"use client";

import { useEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";
import { parseLineItems } from "@/lib/ProductsToJson";
import Cruz from "./Cruz";
// import TicketPrintButton from "./TicketPrinterButton";

import { Orders } from "@/types";

const inter = Inter({ subsets: ["latin"], weight: "400" });

// Hook para bloquear el scroll del <body>
function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;

    if (lock) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [lock]);
}

interface OrderCardProps {
  order: Orders;
  onMoveToReady: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function OrderCard({
  order,
  onMoveToReady,
  onCancelOrder,
}: OrderCardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);

  // Referencia al contenedor para activar/desactivar 'inert'
  const gridRef = useRef<HTMLDivElement>(null);

  // Bloqueo de scroll cuando hay modal
  useLockBodyScroll(!!selectedOrder);

  // Aplicar atributo 'inert' + cortar interacciones visualmente
  useEffect(() => {
    const el = gridRef.current;

    if (!el) return;
    if (selectedOrder) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", onKey, true);

    return () => document.removeEventListener("keydown", onKey, true);
  }, [selectedOrder]);

  const handleClose = () => setSelectedOrder(null);

  const handleDeleteOrder = () => {
    if (selectedOrder?.id_order) {
      onCancelOrder(selectedOrder.id_order);
      handleClose();
    }
  };

  const openModal = (order: Orders) => {
    if (selectedOrder) return;
    setSelectedOrder(order);
  };

  const handleMoveToReady = () => {
    if (order.id_order) {
      onMoveToReady(order.id_order);
      handleClose();
    }
  };

  const obj = parseLineItems(order.products);

  return (
    <section className={`${inter.className} relative`}>
      {/* GRID / CARD */}
      <div
        ref={gridRef}
        className={
          selectedOrder ? "pointer-events-none opacity-95 select-none" : ""
        }
      >
        <div className="container flex w-80 flex-col rounded-xl bg-[#FCEDCC] shadow-lg shadow-black/50">
          <div className="flex flex-col items-center rounded-t-xl bg-[#FD4E4E] px-5 py-1">
            <div className="flex w-full items-center justify-between">
              <small className="font-semibold">
                #{order.id_order?.slice(0, 5)}
              </small>
              <small className="font-semibold">
                {new Date().toLocaleTimeString()}
              </small>
            </div>
            <b className="block">{order.name}</b>
          </div>

          <div className="flex flex-col overflow-y-scroll max-h-60 items-start">
            {/* Productos */}
            {order.products && order.products.length > 0 ? (
              obj.map((product, index) => (
                <div key={index} className="flex gap-3 p-5">
                  <p className="mt-3 text-xl font-bold">{product.quantity}x</p>
                  <ul className="flex flex-col gap-1">
                    <li className="font-bold">{product.name}</li>
                    <li className="font-bold">Tamaño: {product.size}</li>
                  </ul>
                </div>
              ))
            ) : (
              <div className="p-5">
                <p className="text-gray-600">No hay productos</p>
              </div>
            )}

            <button
              className="mx-auto cursor-pointer rounded-t-xl border bg-red-500 px-5 font-medium text-white"
              disabled={!!selectedOrder}
              onClick={() => openModal(order)}
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>

      {/* MODAL + BACKDROP */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel del modal */}
          <aside
            key={selectedOrder.id_order}
            aria-modal="true"
            className="relative z-50 h-full w-[420px] bg-[#FCEDCC] shadow-xl shadow-black/40 transition-all duration-300"
            role="dialog"
          >
            <div className="flex items-center justify-between bg-[#EEAA4B] px-5 py-3">
              <p className="text-md text-center font-bold text-black">
                En preparación
              </p>
              <button
                aria-label="Cerrar detalles"
                className="cursor-pointer"
                onClick={handleClose}
              >
                <Cruz />
              </button>
            </div>

            {/* CONTENIDO */}
            <section className="flex h-[calc(100%-56px)] flex-col gap-1 overflow-y-auto px-5 pb-6">
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
              <p>{selectedOrder.delivery_mode}</p>

              <h3 className="text-center font-bold underline">Pedido</h3>
              <ul className="flex flex-col gap-1">
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  obj.map((product, index) => (
                    <li key={index} className="flex justify-between gap-5">
                      <b>{product.quantity}x</b>
                      <ul>
                        <li className="font-bold">{product.name}</li>
                        <li>Tamaño: {product.size}</li>
                        {Array.isArray(product.sin) &&
                          product.sin.length > 0 && (
                            <div className="flex gap-2 items-center">
                              <p className="font-normal">Sin:</p>
                              <small>{product.sin.join(", ")}</small>
                            </div>
                          )}
                        {Array.isArray(product.sin) &&
                          product.sin.length === 0 &&
                          null}
                        {product.fries && <li>Papas: {product.fries}</li>}
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
                Pago:{" "}
                {selectedOrder.payment_method === "account_money"
                  ? "Mercado Pago"
                  : "Efectivo"}
              </b>

              {selectedOrder.order_notes && (
                <>
                  <h3 className="text-center font-bold underline">
                    Notas del cliente
                  </h3>
                  <p>{selectedOrder.order_notes}</p>
                </>
              )}

              <div className="mt-2 flex flex-col gap-3">
                <button
                  className="rounded-xl cursor-pointer hover:bg-[#EEAA4B]/50 bg-[#EEAA4B] transition-all py-2 font-bold text-black"
                  onClick={handleMoveToReady}
                >
                  Listo para entregar
                </button>
                <button
                  //  onClick={TicketPrintButton}
                  className="rounded-xl border-2 border-dashed border-[#EEAA4B] py-2 font-bold text-black"
                >
                  Imprimir ticket
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="rounded-xl bg-red-500 py-2 font-bold text-white"
                >
                  Cancelar pedido
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </section>
  );
}
