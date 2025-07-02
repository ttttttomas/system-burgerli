import OrderCard from "./components/OrderCard";
import OrderReadyCard from "./components/OrderReadyCard";
import PopupOrders from "./components/PopupOrders";

export default async function HomePage() {
  return (
    <main className="ml-80 h-full font-bold text-black">
      <PopupOrders />
      <h2 className="pt-5 text-2xl font-bold">Pedidos en preparación</h2>
      {/* LISTA DE PEDIDOS EN PREPARACION*/}
      <section className="my-10 flex flex-wrap items-center justify-center gap-14">
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
        <OrderCard />
      </section>
      <h2 className="text-2xl font-bold">Pedidos listos para retirar</h2>
      {/* LISTA DE PEDIDOS PARA RETIRAR */}
      <section className="my-10 flex items-center gap-10">
        <OrderReadyCard />
        <OrderReadyCard />
        <OrderReadyCard />
        <OrderReadyCard />
      </section>
    </main>
  );
}
