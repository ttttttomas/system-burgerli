
export default function AdminPage() {
  
  const mockData = [
    {
      id: "#123456",
      cliente: "Mariano Fernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "Entregado",
    },
    {
      id: "#123456",
      cliente: "Martina Perez",
      fecha: "08/09/25",
      metodo: "Efectivo",
      estado: "En preparación",
    },
    {
      id: "#123456",
      cliente: "Lucía Hernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "En camino",
    },
    {
      id: "#123456",
      cliente: "Mariano Fernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "Entregado",
    },
    {
      id: "#123456",
      cliente: "Martina Perez",
      fecha: "08/09/25",
      metodo: "Efectivo",
      estado: "En preparación",
    },
    {
      id: "#123456",
      cliente: "Lucía Hernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "En camino",
    },
    {
      id: "#123456",
      cliente: "Mariano Fernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "Entregado",
    },
    {
      id: "#123456",
      cliente: "Martina Perez",
      fecha: "08/09/25",
      metodo: "Efectivo",
      estado: "En preparación",
    },
    {
      id: "#123456",
      cliente: "Lucía Hernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "En camino",
    },
    {
      id: "#123456",
      cliente: "Mariano Fernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "Entregado",
    },
    {
      id: "#123456",
      cliente: "Martina Perez",
      fecha: "08/09/25",
      metodo: "Efectivo",
      estado: "En preparación",
    },
    {
      id: "#123456",
      cliente: "Lucía Hernandez",
      fecha: "08/09/25",
      metodo: "Tarjeta",
      estado: "En camino",
    },
    // ... repetí o mapeá más registros si querés
  ];

  return (
    <main className="mr-10 ml-80 h-full text-black">
      <section className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-semibold">Anatilica - General</h1>
        <button className="rounded-xl bg-orange-300 px-5 py-1 text-xl" type="button">
          Vista general
        </button>
      </section>
      <section className="flex items-center justify-between">
        <div className="container grid flex-1 grid-cols-2 gap-5">
          <div className="rounded-xl bg-orange-300 p-2">
            <p className="text-lg font-normal">Filtros</p>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center justify-between">
                <small>Semana</small>
                <input id="" name="filter" type="radio" />
              </li>
              <li className="flex items-center justify-between">
                <small>Mes</small>
                <input id="" name="filter" type="radio" />
              </li>
              <li className="flex items-center justify-between">
                <small>Año</small>
                <input id="" name="filter" type="radio" />
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-orange-300 p-2">
            <p className="text-lg font-normal">Ventas totales</p>
            <b>4000</b>
            <p className="text-red-500">2,25%</p>
            <small>Desde la semana</small>
          </div>
          <div className="rounded-xl bg-orange-300 p-2">
            <p className="text-lg font-normal">Ventas totales</p>
            <b>+ 15,57%</b>
            <p className="text-green-500">4,25%</p>
            <small>Desde la semana</small>
          </div>
          <div className="rounded-xl bg-orange-300 p-2">
            <p className="text-lg font-normal">Ingresos totales</p>
            <b>$3.000.000</b>
            <p className="text-green-500">8%</p>
            <small>Desde la semana</small>
          </div>
        </div>
        <div className="h-full w-3/4 bg-black">
          <p className="text-white">Ingresos totales</p>
        </div>
      </section>
      <section className="mt-20 flex flex-col gap-5">
        <h2 className="font-bold">Venta de productos</h2>
        <table className="w-full table-auto border-collapse rounded-md">
          <thead className="bg-[#3f2e1f] text-white">
            <tr>
              {[
                "Nombre",
                "Nombre",
                "Cant. vendida",
                "Ingresos",
                "% total de ventas",
                "var. periodo anterior",
              ].map((header, i) => (
                <th key={i} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span>{header}</span>
                    {/* {i < 5 && <ArrowUpDown className="w-4 h-4" />} */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-[#f5e6c8] text-sm text-black">
            {mockData.map((row, i) => (
              <tr
                key={i}
                className="border-t border-[#d9cbb3] transition-colors hover:bg-[#f3dbc0]"
              >
                <td className="px-4 py-2">{row.id}</td>
                <td className="px-4 py-2">{row.cliente}</td>
                <td className="px-4 py-2">{row.fecha}</td>
                <td className="px-4 py-2">{row.metodo}</td>
                <td className="px-4 py-2">{row.estado}</td>
                <td className="px-4 py-2">{row.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
