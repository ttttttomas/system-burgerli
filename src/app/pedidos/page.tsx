"use client";
import OrderCard from "../components/OrderCard";
import OrderReadyCard from "../components/OrderReadyCard";
import PopupOrders from "../components/PopupOrders";
import { useOrders } from "../context/OrdersContext";
export default function HomePage() {
  const {
    newOrders,
    ordersInPreparation,
    ordersReady,
    showAudioBanner,
    moveToPreparation,
    moveToReady,
    markAsDelivered,
    cancelOrder,
    enableAudioNotifications,
  } = useOrders();

  return (
    <main className="ml-77 h-full font-bold text-black">
      {/* Banner para habilitar notificaciones de audio */}
      {showAudioBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="font-bold text-lg">Habilitar notificaciones de sonido</p>
                <p className="text-sm opacity-90">Haz clic aquí para recibir alertas sonoras cuando lleguen nuevos pedidos</p>
              </div>
            </div>
            <button
              onClick={enableAudioNotifications}
              className="bg-white text-orange-500 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors"
            >
              Activar Sonido
            </button>
          </div>
        </div>
      )}
      
      <PopupOrders
        orders={newOrders}
        onMoveToPreparation={moveToPreparation}
        onCancelOrder={(orderId: string) => cancelOrder(orderId, "new")}
      />
      <h2 className="pt-5 text-2xl font-bold">Pedidos en preparación</h2>
      {/* LISTA DE PEDIDOS EN PREPARACION*/}
      <section className="my-10 flex flex-wrap items-center justify-start gap-14">
        {ordersInPreparation.length > 0 ? (
          ordersInPreparation.map((order, index) => (
            <OrderCard
              key={order.id_order || index}
              order={order}
              onMoveToReady={moveToReady}
              onCancelOrder={(orderId: string) =>
                cancelOrder(orderId, "preparation")
              }
            />
          ))
        ) : (
          <p className="text-gray-500">No hay pedidos en preparación.</p>
        )}
      </section>
      <h2 className="text-2xl font-bold">Pedidos listos para retirar</h2>
      {/* LISTA DE PEDIDOS PARA RETIRAR */}
      <section className="my-10 flex items-center gap-10">
        {ordersReady.length > 0 ? (
          ordersReady.map((order, index) => (
            <OrderReadyCard
              key={order.id_order || index}
              order={order}
              onMarkAsDelivered={markAsDelivered}
              onCancelOrder={(orderId: string) => cancelOrder(orderId, "ready")}
            />
          ))
        ) : (
          <p className="text-gray-500">No hay pedidos listos para retirar.</p>
        )}
      </section>
      {/* <footer>
        <h6 className="text-3xl">Datos de la sesión:</h6>
        <ul className="list-disc ml-10 flex flex-col gap-1">
          <li>Local: {session?.local}</li>
          <li>Usuario: {session?.username}</li>
          <li>Rol: {session?.rol === "employed" ? "Empleado" : "Administrador"}</li>
        </ul>
      </footer> */}
    </main>
  );
}
