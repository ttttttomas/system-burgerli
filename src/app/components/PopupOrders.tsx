"use client";
import {useState} from "react";

import PopupIcon from "./PopupIcon";
import NewOrderCard from "./NewOrderCard";
import NewOrderIcon from "./NewOrderIcon";
import Cruz from "./Cruz";

export default function PopupOrders() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <section>
      {/*  Blur overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60" /> // sin blur
      )}
      <div
        className={
          isOpen
            ? "absolute top-5 right-94 z-40 flex cursor-pointer items-center transition-all duration-300"
            : "absolute top-5 right-5 z-40 flex cursor-pointer items-center transition-all duration-300"
        }
        onClick={handleClick}
      >
        <p className="z-40 -mx-4 rounded-full bg-[#4BBC34] p-1 text-2xl font-bold text-black">+9</p>
        <div className="rounded-full bg-[#4BBC34] p-2 shadow-xl shadow-black/40">
          <PopupIcon />
        </div>
      </div>

      {isOpen ? (
        <aside
          className={`absolute top-0 right-0 z-40 flex ${isOpen ? "opacity-100" : "opacity-0"} h-full flex-col gap-5 bg-[#FCEDCC] shadow-xl shadow-black/40 transition-all duration-300`}
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
          <section className="flex flex-col gap-5 px-5 py-3">
            <NewOrderCard />
            <NewOrderCard />
            <NewOrderCard />
            <NewOrderCard />
            <NewOrderCard />
          </section>
        </aside>
      ) : (
        ""
      )}
    </section>
  );
}
