"use client";
import { useSession } from "../context/SessionContext";
import { useEffect, useState, useMemo } from "react";
import { Orders } from "@/types";
import Cruz from "../components/Cruz";
import { parseLineItems } from "@/lib/ProductsToJson";
import TicketPrintButton from "../components/TicketPrinterButton";
import Lupa from "../components/Lupa";

const getSelectedOptions = (product: any): string[] => {
  return product.selected_options || product.selectedOptions || [];
};

export default function OrderHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Orders[]>([]);
  const { session, locals: getLocals } = useSession();
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);
  const [locales, setLocales] = useState<any[]>([]);
  
  // Estados para los filtros
  const [searchClient, setSearchClient] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [selectedLocal, setSelectedLocal] = useState<string>("all");

  const openModal = (order: Orders) => {
    setSelectedOrder(order);
  };

  const handleClick = () => {
    setSelectedOrder(null);
  };

  // Cargar locales para admin
  useEffect(() => {
    const fetchLocals = async () => {
      try {
        const localsData = await getLocals();
        setLocales(localsData || []);
      } catch (error) {
        console.error("Error cargando locales:", error);
      }
    };

    if (session?.rol === "admin") {
      fetchLocals();
    }
  }, [session]);

  // Filtrar órdenes por estado entregado
  const filteredData = (data: Orders[]) => {
    return data.filter((item) => {
      const isDelivered = item.status === "delivered";
      
      // Si es empleado, solo mostrar su local
      if (session?.rol === "employed") {
        return isDelivered && item.local.toLowerCase() === session?.local.toLowerCase();
      }
      
      // Si es admin, mostrar todos los locales
      return isDelivered;
    });
  };

  // Cargar órdenes
  useEffect(() => {
    if (session) {
      fetch(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/getOrders`,
      )
        .then((res) => res.json())
        .then((data) => {
          setOrders(filteredData(data));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error cargando órdenes:", error);
          setLoading(false);
        });
    }
  }, [session]);

  // Aplicar filtros de búsqueda
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro por cliente
      const matchesClient = order.name
        .toLowerCase()
        .includes(searchClient.toLowerCase());

      // Filtro por fecha (solo día, sin hora)
      const orderDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("es-AR")
        : "";
      const matchesDate = orderDate.includes(searchDate);

      // Filtro por método de pago
      const paymentMethodText =
        order.payment_method === "account_money" ? "mercado pago" : "efectivo";
      const matchesPayment = paymentMethodText.includes(
        searchPaymentMethod.toLowerCase()
      );

      // Filtro por local (solo para admin)
      const matchesLocal = selectedLocal === "all" || order.local === selectedLocal;

      return matchesClient && matchesDate && matchesPayment && matchesLocal;
    });
  }, [orders, searchClient, searchDate, searchPaymentMethod, selectedLocal]);

  if (loading) {
    return (
      <main className="mr-10 ml-80 flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#b36921]" />
          <p className="mt-4 text-[#4b2f1e]">Cargando historial...</p>
        </div>
      </main>
    );
  }

  const obj = selectedOrder ? parseLineItems(selectedOrder.products as string[]) : null;

  return (
    <main className="mr-10 ml-80 flex flex-col justify-start gap-5 text-black pb-10">
      {/* Header */}
      <section className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-semibold">
          Historial de pedidos{session?.rol === "employed" ? ` - ${session?.local}` : ""}
        </h1>
        <button
          className="rounded-xl bg-[#EEAA4B] px-5 py-2 text-lg font-medium hover:bg-[#d99a3b] transition-colors"
          type="button"
        >
          Vista general
        </button>
      </section>

      {/* Filtros de búsqueda */}
      <section className="flex items-center justify-start gap-5 flex-wrap">
        <div className="flex w-64 items-center gap-2 rounded-xl bg-[#EEAA4B] px-4 py-2">
          <Lupa />
          <input
            className="flex-1 bg-transparent font-medium placeholder:text-black/70 focus:outline-none"
            placeholder="Buscar por cliente"
            type="text"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
          />
        </div>
        <div className="flex w-64 items-center gap-2 rounded-xl bg-[#EEAA4B] px-4 py-2">
          <Lupa />
          <input
            className="flex-1 bg-transparent font-medium placeholder:text-black/70 focus:outline-none"
            placeholder="Buscar por fecha"
            type="text"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <div className="flex w-64 items-center gap-2 rounded-xl bg-[#EEAA4B] px-4 py-2">
          <Lupa />
          <input
            className="flex-1 bg-transparent font-medium placeholder:text-black/70 focus:outline-none"
            placeholder="Buscar por método de pago"
            type="text"
            value={searchPaymentMethod}
            onChange={(e) => setSearchPaymentMethod(e.target.value)}
          />
        </div>
        
        {/* Filtro por local - Solo para admin */}
        {session?.rol === "admin" && locales.length > 0 && (
          <div className="flex w-64 items-center gap-2 rounded-xl bg-[#EEAA4B] px-4 py-2">
            <select
              className="flex-1 bg-transparent font-medium focus:outline-none cursor-pointer"
              value={selectedLocal}
              onChange={(e) => setSelectedLocal(e.target.value)}
            >
              <option value="all">Todos los locales</option>
              {locales.map((local) => (
                <option key={local.id} value={local.name}>
                  {local.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Tabla de órdenes */}
      <section className="w-full overflow-x-auto rounded-xl shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-[#3f2e1f] text-white">
            <tr>
              {(session?.rol === "admin" 
                ? ["ID", "Cliente", "Local", "Fecha", "Método de pago", "Estado", "Más detalles"]
                : ["ID", "Cliente", "Fecha", "Método de pago", "Estado", "Más detalles"]
              ).map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left font-medium whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>{header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-[#f5e6c8] text-sm text-black">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-[#d9cbb3] transition-colors hover:bg-[#f3dbc0]"
                >
                  <td className="px-4 py-3">
                    #
                    {row.dailySequenceNumber?.toString().padStart(3, "0") ||
                      row.id_order?.slice(-6) ||
                      "---"}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  {session?.rol === "admin" && (
                    <td className="px-4 py-3">{row.local}</td>
                  )}
                  <td className="px-4 py-3">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString("es-AR")
                      : "---"}
                  </td>
                  <td className="px-4 py-3">
                    {row.payment_method === "account_money"
                      ? "Mercado Pago"
                      : "Efectivo"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                      Entregado
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal(row)}
                      className="font-semibold text-[#3f2e1f] hover:underline cursor-pointer transition-all"
                    >
                      Más detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={session?.rol === "admin" ? 7 : 6}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No se encontraron pedidos con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Modal de detalles */}
      {selectedOrder && (
        <aside className="fixed top-0 right-0 z-40 flex h-full w-96 flex-col gap-5 bg-[#FCEDCC] text-black shadow-xl shadow-black/40 transition-all duration-300 overflow-y-auto">
          <div className="flex items-center justify-between bg-green-500 px-5 py-3 sticky top-0 z-10">
            <p className="text-md text-center font-bold text-black">
              Pedido entregado
            </p>
            <div className="cursor-pointer" onClick={handleClick}>
              <Cruz />
            </div>
          </div>
          <section className="flex flex-col gap-1 px-5 pb-5">
            <h1 className="text-center text-2xl font-bold">
              Detalles del pedido
            </h1>
            <p className="text-center text-lg font-semibold">
              (#
              {selectedOrder.dailySequenceNumber?.toString().padStart(3, "0") ||
                selectedOrder.id_order?.slice(-6) ||
                "---"}
              )
            </p>
            <div className="flex items-center justify-between text-sm">
              <p>
                {selectedOrder.created_at
                  ? new Date(selectedOrder.created_at).toLocaleDateString(
                      "es-AR"
                    )
                  : "---"}
              </p>
              <p>
                {selectedOrder.created_at
                  ? new Date(selectedOrder.created_at).toLocaleTimeString(
                      "es-AR"
                    )
                  : "---"}
              </p>
            </div>
            <h2 className="text-center font-bold underline mt-3">
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
                Teléfono: <b>{selectedOrder.phone}</b>
              </li>
              {selectedOrder.address && (
                <li>
                  Dirección: <b>{selectedOrder.address}</b>
                </li>
              )}
            </ul>
            <h2 className="text-center font-bold underline mt-3">
              Forma de entrega
            </h2>
            <p className="text-center">
              {selectedOrder.delivery_mode === "pickup"
                ? "Retiro en local"
                : "Delivery"}
            </p>
            <h3 className="text-center font-bold underline my-3">Pedido</h3>
            <ul className="flex flex-col gap-3">
              {selectedOrder.products && obj ? (
                obj.map((product, index) => (
                  <div key={index} className="flex justify-between gap-3">
                    <li className="flex justify-between items-start gap-2 flex-1">
                      <div className="flex gap-2">
                        <b>{product.quantity}x</b>
                        <div className="flex flex-col">
                          <span className="font-bold text-wrap">
                            {product.name}
                          </span>
                          {product.size && (
                            <span className="text-sm">
                              Tamaño: {product.size}
                            </span>
                          )}
                          {product.fries && (
                            <span className="text-sm">
                              Papas: {product.fries}
                            </span>
                          )}
                          {(() => {
                            const selectedOpts = getSelectedOptions(product);
                            return (
                              selectedOpts.length > 0 && (
                                <span className="text-sm">
                                  Opciones: {selectedOpts.join(", ")}
                                </span>
                              )
                            );
                          })()}
                        </div>
                      </div>
                    </li>
                    <small className="font-semibold whitespace-nowrap">
                      ${product.price.toLocaleString()}
                    </small>
                  </div>
                ))
              ) : (
                <li>No hay productos</li>
              )}
            </ul>
            <div className="my-3 flex items-center justify-between text-lg border-t border-black/20 pt-3">
              <b>Total</b>
              <b>${selectedOrder.price.toLocaleString()}</b>
            </div>
            <p className="font-semibold">
              Pago:{" "}
              {selectedOrder.payment_method === "account_money"
                ? "Mercado Pago"
                : "Efectivo"}
            </p>
            {selectedOrder.order_notes && (
              <>
                <h3 className="my-3 text-center font-bold underline">
                  Notas del cliente
                </h3>
                <p className="text-sm bg-yellow-100 p-3 rounded-lg">
                  {selectedOrder.order_notes}
                </p>
              </>
            )}
            <div className="flex flex-col gap-3 mt-5">
              <TicketPrintButton order={selectedOrder} />
            </div>
          </section>
        </aside>
      )}
    </main>
  );
}
