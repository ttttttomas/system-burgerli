"use client";
import { useState } from "react";

import Moto from "./Moto";
import Ubicacion from "./Ubicacion";
import Tarjeta from "./Tarjeta";

import { Orders } from "@/types";
import { parseLineItems } from "@/lib/ProductsToJson";

interface NewOrderCardProps {
  order: Orders;
  orderNumber?: string;
  timeAgo?: string;
  onMoveToPreparation: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function NewOrderCard({
  order,
  timeAgo = "Hace un momento",
  onMoveToPreparation,
  onCancelOrder,
}: NewOrderCardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);

  const productCount = order.products?.length || 0;

  const openModal = (order: Orders) => {
    setSelectedOrder(order);
    console.log(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const handleMoveToPreparation = () => {
    if (order.id_order) {
      onMoveToPreparation(order.id_order);
      closeModal();
    }
  };

  const handleCancelOrder = () => {
    if (order.id_order) {
      onCancelOrder(order.id_order);
      closeModal();
    }
  };

  const obj = parseLineItems(order.products);
  console.log(obj);

  return (
    <>
      <div
        className="flex w-80 cursor-pointer flex-col gap-1 rounded-xl bg-[#EEAA4B] px-5 py-3 text-black transition-all hover:bg-[#E09A3B]"
        onClick={() => openModal(order)}
      >
        <small>#{order.id_order?.slice(0, 10) + "..."}</small>
        <div className="flex items-center justify-between">
          <b className="text-lg">{order.name}</b>
          <p className="font-medium">{timeAgo}</p>
        </div>
        <small>
          {productCount} {productCount === 1 ? "producto" : "productos"}
        </small>
      </div>

      {/* Modal con overlay */}
      {selectedOrder && (
        <>
          {/* Overlay oscuro */}
          <div
            className="fixed inset-0 z-50 cursor-pointer bg-black/70"
            onClick={closeModal}
          />

          {/* Modal centrado con dos columnas */}
          <div className="fixed top-1/2 left-1/2 z-50 grid max-h-[95vh] w-[80%] max-w-5xl -translate-x-1/2 -translate-y-1/2 transform grid-cols-2 overflow-hidden rounded-xl shadow-2xl">
            {/* COLUMNA IZQUIERDA - Información del cliente */}
            <div className="flex flex-col gap-5 bg-[#FCEDCC] p-8">
              {/* Logo */}
              <div className="flex justify-center">
                <img alt="Burgerli" className="h-24 w-24" src="/logo.png" />
              </div>

              {/* Número de pedido */}
              <div className="text-center">
                <h2 className="text-3xl font-bold">
                  Pedido N° #{selectedOrder.id_order?.slice(0, 10) + "..."}
                </h2>
              </div>

              {/* Fecha y hora */}
              <div className="flex justify-between text-sm">
                <span>{new Date().toLocaleDateString()}</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>

              {/* Datos del cliente */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Datos del cliente</h3>
                <div className="flex gap-2">
                  <p className="font-normal">Nombre:</p>
                  <b>{selectedOrder.name}</b>
                </div>
                <div className="flex gap-2">
                  <p className="font-normal">Mail:</p>
                  <b>{selectedOrder.email}</b>
                </div>
                <div className="flex gap-2">
                  <p className="font-normal">Telefono:</p>
                  <b>{selectedOrder.phone}</b>
                </div>
                {selectedOrder.address && (
                  <div className="flex gap-2">
                    <p className="font-normal">Direccion:</p>
                    <b>{selectedOrder.address}</b>
                  </div>
                )}
              </div>

              {/* Forma de entrega */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Forma de entrega</h3>
                <div className="flex items-center gap-2">
                  <span>
                    {selectedOrder.delivery_mode === "delivery" ? (
                      <Moto />
                    ) : (
                      <span>
                        <Ubicacion fill="black" />
                      </span>
                    )}
                  </span>
                  <span>
                    {selectedOrder.delivery_mode === "pickup"
                      ? "Retiro en local"
                      : "Delivery"}
                  </span>
                </div>
              </div>

              {/* Nota del cliente */}
              {selectedOrder.order_notes && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold">Nota del cliente</h3>
                  <p className="text-sm font-normal">
                    {selectedOrder.order_notes}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-auto flex flex-col gap-3">
                <button
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-[#EEAA4B] px-5 py-2 font-bold text-black transition-all hover:bg-[#E09A3B]"
                  onClick={handleMoveToPreparation}
                >
                  <p>En preparación</p>
                  <span className="text-sm">Productos ({productCount})</span>
                </button>
                <button
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-bold text-white transition-all hover:bg-red-600"
                  onClick={handleCancelOrder}
                >
                  🗑️ Cancelar pedido
                </button>
              </div>
            </div>

            {/* COLUMNA DERECHA - Lista de productos */}
            <div className="flex flex-col bg-white">
              {/* Lista de productos con scroll */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col gap-4">
                  {selectedOrder.products &&
                  selectedOrder.products.length > 0 ? (
                    obj.map((product, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 border-b border-gray-300 pb-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <span className="font-bold">
                              {product.quantity}x
                            </span>
                            <div className="flex flex-col gap-1">
                              <p className="font-bold">{product.name}</p>
                              {product.selectedOptions &&
                                product.selectedOptions.length > 0 && (
                                  <p className="font-bold">
                                    Opciones:{" "}
                                    {product.selectedOptions.join(", ")}
                                  </p>
                                )}
                              {product.fries && (
                                <div className="flex gap-2 items-center">
                                  <p className="font-normal">Papas:</p>
                                  <small>{product.fries}</small>
                                </div>
                              )}
                              <div className="flex gap-2 items-center">
                                {product.size && (
                                  <>
                                    <p className="font-normal">Tamaño:</p>
                                    <small>{product.size}</small>
                                  </>
                                )}
                              </div>
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
                            </div>
                          </div>
                          <span className="font-bold">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">
                      No hay productos en este pedido
                    </p>
                  )}
                </div>
              </div>

              {/* Total y método de pago - Fixed al fondo */}
              <div className="border-t border-gray-300 bg-white p-8">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.price.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-5 text-sm">
                  <span>Pago:</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {" "}
                      {selectedOrder.payment_method === "Efectivo"
                        ? " Efectivo"
                        : " Mercado Pago"}
                    </span>
                    <span>
                      <Tarjeta />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón cerrar en la esquina superior derecha */}
            <button
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70"
              onClick={closeModal}
            >
              ✕
            </button>
          </div>
        </>
      )}
    </>
  );
}
