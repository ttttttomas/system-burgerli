"use client";
import {useState, useEffect} from "react";

import PopupIcon from "./PopupIcon";
import NewOrderCard from "./NewOrderCard";
import NewOrderIcon from "./NewOrderIcon";
import Cruz from "./Cruz";

import {Orders} from "@/types";

interface PopupOrdersProps {
  orders: Orders[];
  onMoveToPreparation: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export default function PopupOrders({orders, onMoveToPreparation, onCancelOrder}: PopupOrdersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const orderCount = orders.length;

  const count = orderCount > 9 ? "+9" : orderCount;

  return (
    <section>
      {/*  Blur overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 cursor-pointer" onClick={() => setIsOpen(false)} />
      )}
      <div
        className={
          isOpen
            ? "fixed top-5 right-94 z-40 flex cursor-pointer items-center transition-all duration-300"
            : "fixed top-5 right-5 z-40 flex cursor-pointer items-center transition-all duration-300"
        }
        onClick={handleClick}
      >
        <p className="z-40 -mx-4 rounded-full bg-[#4BBC34] p-1 text-2xl font-bold text-black">
          {count}
        </p>
        <div className="rounded-full bg-[#4BBC34] p-2 shadow-xl shadow-black/40">
          <PopupIcon />
        </div>
      </div>

      {isOpen ? (
        <aside
          className={`fixed top-0 right-0 z-40 flex ${isOpen ? "opacity-100" : "opacity-0"} h-full flex-col gap-5 bg-[#FCEDCC] shadow-xl shadow-black/40 transition-all duration-300`}
        >
          <div className="flex items-center justify-between bg-[#EEAA4B] px-5 py-3">
            <NewOrderIcon />
            <h2 className="bg-[#EEAA4B] text-center text-xl font-bold text-black">
              Pedidos nuevos
            </h2>
            <div className="cursor-pointer" onClick={handleClick}>
              <Cruz />
            </div>
          </div>
          <section className="flex flex-col gap-5 overflow-y-auto px-5 py-3">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <NewOrderCard
                  key={order.id_order || index}
                  order={order}
                  orderNumber={`${index + 1}`}
                  timeAgo="Hace un momento"
                  onMoveToPreparation={onMoveToPreparation}
                  onCancelOrder={onCancelOrder}
                />
              ))
            ) : (
              <p className="text-center text-gray-600">No hay pedidos nuevos</p>
            )}
          </section>
        </aside>
      ) : (
        ""
      )}
    </section>
  );
}
