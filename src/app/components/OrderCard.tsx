"use client";

import {useEffect, useState} from "react";

import {Order} from "../../types";

import Cruz from "./Cruz";

const orders = [
  {
    id: "123456",
    combo: "1x",
    user_client: "Mariano",
    payment_method: "PagoPal",
    delivery_mode: "Delivery",
    price: 10,
    status: "Pendiente",
    coupon: "20% OFF",
    order_notes: "Esto es una nota",
    local: "Lima",
    burgers: "Hamburguesa triple queso",
    fries: "Papas",
    drinks: "Coca 500ml",
    sin: "Mostaza, ketchup",
    extras: "Panceta",
  },
  {
    id: "123456",
    combo: "1x",
    user_client: "Mariano",
    payment_method: "PagoPal",
    delivery_mode: "Delivery",
    price: 10,
    status: "Pendiente",
    coupon: "20% OFF",
    order_notes: "Esto es una nota",
    local: "Lima",
    burgers: "Hamburguesa triple queso",
    fries: "Papas",
    drinks: "Coca 500ml",
    sin: "Mostaza, ketchup",
    extras: "Panceta",
  },
  {
    id: "123456",
    combo: "2x",
    user_client: "Mariano",
    payment_method: "PagoPal",
    delivery_mode: "Delivery",
    price: 10,
    status: "Pendiente",
    coupon: "20% OFF",
    order_notes: "Esto es una nota",
    local: "Lima",
    burgers: "Hamburguesa triple queso",
    fries: "Papas",
    drinks: "Coca 500ml",
    sin: "Mostaza, ketchup",
    extras: "Panceta",
  },
];

export default function OrderCard() {
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleClick = () => {
    setSelectedOrder(null);
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <section className="container flex max-w-80 flex-col rounded-xl bg-[#FCEDCC] shadow-lg shadow-black/50">
      <div className="flex flex-col items-center rounded-t-xl bg-[#FD4E4E] px-5 py-1">
        <div className="flex w-full items-center justify-between">
          <small className="font-semibold">#123456</small>
          <small className="font-semibold">Hace 30 minutos</small>
        </div>
        <b className="block">Mariano</b>
      </div>
      <div className="flex flex-col items-start">
        <div className="flex gap-3 p-5">
          <p className="mt-3 text-xl font-bold">1x</p>
          <ul className="flex flex-col gap-1">
            <li className="font-bold">Hamburguesa triple queso</li>
            <li>
              <b>Extra:</b> Panceta
            </li>
            <li>
              <b>Sin:</b> Mostaza, ketchup
            </li>
            <li>
              <b>Papas:</b> Clasicas
            </li>
          </ul>
        </div>
        <div className="flex gap-3 p-5">
          <p className="text-xl font-bold">1x</p>
          <ul className="flex flex-col gap-1">
            <li className="font-bold">Hamburguesa triple queso</li>
            <li>
              <b>Papas:</b> Burgerli
            </li>
          </ul>
        </div>
        <div className="flex gap-3 p-5">
          <p className="text-xl font-bold">2x</p>
          <ul className="flex flex-col items-center gap-1">
            <li className="font-bold">Coca 500ml</li>
          </ul>
        </div>
        <button
          className="mx-auto cursor-pointer rounded-t-xl border bg-red-500 px-5 font-medium text-white"
          onClick={() => openModal(orders[1])}
        >
          Ver detalles
        </button>
      </div>
      {selectedOrder && (
        <aside className="absolute top-0 right-0 z-40 flex h-full flex-col gap-5 bg-[#FCEDCC] shadow-xl shadow-black/40 transition-all duration-300">
          <div className="flex items-center justify-between bg-[#EEAA4B] px-5 py-3">
            <p className="text-md bg-[#EEAA4B] text-center font-bold text-black">En preparación</p>
            <div className="cursor-pointer" onClick={handleClick}>
              <Cruz />
            </div>
          </div>
          <section className="flex flex-col gap-1 px-5">
            <h1 className="text-center text-2xl font-bold">Detalles del pedido</h1>
            <p className="text-center">(#123456)</p>
            <div className="flex items-center justify-between text-sm">
              <p>08/09/2025</p>
              <p>21:25</p>
            </div>
            <h2 className="text-center font-bold underline">Datos del cliente</h2>
            <ul className="flex flex-col gap-1">
              <li>
                Nombre: <b>Mariano</b>
              </li>
              <li>
                Mail: <b>Correofalso123@gmail.com</b>
              </li>
              <li>
                Telefono: <b>123456789</b>
              </li>
              <li>
                Direccion: <b>Calle falsa 1234</b>
              </li>
            </ul>
            <h2 className="text-center font-bold underline">Forma de entrega</h2>
            <p>Delivery</p>
            <h3 className="text-center font-bold underline">Pedido</h3>
            <ul className="flex flex-col gap-1">
              <li className="flex gap-5">
                <b>1x</b>
                <ul>
                  <li className="font-bold">Hamburguesa triple queso</li>
                  <li>
                    <b>Extra:</b> Panceta
                  </li>
                  <li>
                    <b>Sin:</b> Mostaza, ketchup
                  </li>
                  <li>
                    <b>Papas:</b> Clasicas
                  </li>
                </ul>
                <small>$11.200</small>
              </li>
              <hr className="border-[1px] border-black" />
              <li className="flex gap-5">
                <b>1x</b>
                <ul>
                  <li className="font-bold">Hamburguesa triple queso</li>
                  <li>
                    <b>Extra:</b> Panceta
                  </li>
                  <li>
                    <b>Sin:</b> Mostaza, ketchup
                  </li>
                  <li>
                    <b>Papas:</b> Clasicas
                  </li>
                </ul>
                <small>$11.200</small>
              </li>
              <hr className="border-[1px] border-black" />
            </ul>
            <div className="my-2 flex items-center justify-between text-lg">
              <b>Total</b>
              <b>$24.600</b>
            </div>
            <b>Pago: Tarjeta de credito</b>
            <h3 className="my-5 text-center font-bold underline">Notas del cliente</h3>
            <p>Esto es una nota</p>
            <div className="flex flex-col gap-3">
              <button className="rounded-xl bg-[#EEAA4B] py-2 font-bold text-black">
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
      )}
    </section>
  );
}
