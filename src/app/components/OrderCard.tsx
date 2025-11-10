"use client";

import {useEffect, useRef, useState} from "react";
import {Inter} from "next/font/google";

import Cruz from "./Cruz";

import {Orders} from "@/types";

const inter = Inter({subsets: ["latin"], weight: "400"});

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
}

export default function OrderCard({order, onMoveToReady}: OrderCardProps) {
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

  const productCount = order.products?.length || 0;

  return (
    <section className={`${inter.className} relative`}>
      {/* GRID / CARD */}
      <div
        ref={gridRef}
        className={selectedOrder ? "pointer-events-none opacity-95 select-none" : ""}
      >
        <div className="container flex max-w-80 flex-col rounded-xl bg-[#FCEDCC] shadow-lg shadow-black/50">
          <div className="flex flex-col items-center rounded-t-xl bg-[#FD4E4E] px-5 py-1">
            <div className="flex w-full items-center justify-between">
              <small className="font-semibold">#{order.id_order?.slice(0, 7)}</small>
              <small className="font-semibold">Hace 30 minutos</small>
            </div>
            <b className="block">{order.name}</b>
          </div>

          <div className="flex flex-col items-start">
            {/* Productos */}
            {order.products && order.products.length > 0 ? (
              order.products.map((product, index) => (
                <div key={index} className="flex gap-3 p-5">
                  <p className="mt-3 text-xl font-bold">1x</p>
                  <ul className="flex flex-col gap-1">
                    <li className="font-bold">{product}</li>
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
              <p className="text-md text-center font-bold text-black">En preparación</p>
              <button aria-label="Cerrar detalles" className="cursor-pointer" onClick={handleClose}>
                <Cruz />
              </button>
            </div>

            {/* CONTENIDO */}
            <section className="flex h-[calc(100%-56px)] flex-col gap-1 overflow-y-auto px-5 pb-6">
              <h1 className="text-center text-2xl font-bold">Detalles del pedido</h1>
              <p className="text-center">(#{selectedOrder.id_order?.slice(0, 10)})</p>
              <div className="flex items-center justify-between text-sm">
                <p>{new Date().toLocaleDateString()}</p>
                <p>{new Date().toLocaleTimeString()}</p>
              </div>

              <h2 className="text-center font-bold underline">Datos del cliente</h2>
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

              <h2 className="text-center font-bold underline">Forma de entrega</h2>
              <p>{selectedOrder.delivery_mode}</p>

              <h3 className="text-center font-bold underline">Pedido</h3>
              <ul className="flex flex-col gap-1">
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  selectedOrder.products.map((product, index) => (
                    <li key={index} className="flex gap-5">
                      <b>1x</b>
                      <ul>
                        <li className="font-bold">{product}</li>
                      </ul>
                      <small>$0</small>
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

              <b>Pago: {selectedOrder.payment_method}</b>

              {selectedOrder.order_notes && (
                <>
                  <h3 className="my-5 text-center font-bold underline">Notas del cliente</h3>
                  <p>{selectedOrder.order_notes}</p>
                </>
              )}

              <div className="mt-2 flex flex-col gap-3">
                <button
                  className="rounded-xl bg-[#EEAA4B] py-2 font-bold text-black"
                  onClick={handleMoveToReady}
                >
                  Listo para entregar
                </button>
                <button className="rounded-xl border-2 border-dashed border-[#EEAA4B] py-2 font-bold text-black">
                  Imprimir ticket
                </button>
                <button className="rounded-xl bg-red-500 py-2 font-bold text-white">
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
