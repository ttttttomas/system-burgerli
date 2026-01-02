// MainMenuGestion.tsx
// Solo el <main/> (ignorando el aside). TailwindCSS.
// Podés pegarlo dentro de tu layout/page y listo.

import { Pencil, Trash2, Plus } from "lucide-react";

type Row = {
  name: string;
  price: string;
  stock: "Disponible" | "No disponible";
};

function StockPill({ value }: { value: Row["stock"] }) {
  const ok = value === "Disponible";
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-medium">
      <span
        className={[
          "h-2 w-2 rounded-full",
          ok ? "bg-green-500" : "bg-red-500",
        ].join(" ")}
      />
      <span className={ok ? "text-green-700" : "text-red-700"}>{value}</span>
    </span>
  );
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: Row[];
}) {
  return (
    <section className="space-y-3 w-full">
      <h2 className="text-[14px] font-semibold text-neutral-800">{title}</h2>

      <div className="overflow-hidden flex w-full rounded-lg border border-[#3a2a1f]/25">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-[#3a2a1f] text-white">
            <tr>
              <th className="px-4 py-2 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Nombre 
                </span>
              </th>
              <th className="px-4 py-2 font-semibold">
                <span className="inline-flex items-center gap-1">
                  Precio
                </span>
              </th>
              <th className="px-4 py-2 font-semibold text-center">Editar</th>
              <th className="px-4 py-2 font-semibold text-center">Eliminar</th>
              <th className="px-4 py-2 font-semibold text-right">Stock</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={`${r.name}-${idx}`}
                className=
                  "bg-[#f3e3bf] text-neutral-800 border-t border-[#3a2a1f]/15"
              >
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{r.price}</td>

                <td className="px-4 py-2">
                  <button
                    className="mx-auto cursor-pointer inline-flex items-center gap-2 text-green-700 hover:text-green-800"
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="font-medium">Editar</span>
                  </button>
                </td>

                <td className="px-4 py-2">
                  <button
                    className="mx-auto cursor-pointer inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Eliminar</span>
                  </button>
                </td>

                <td className="px-4 py-2 text-right">
                  <StockPill value={r.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className={[
            "inline-flex items-center gap-2 rounded-full cursor-pointer",
            "bg-[#f2b24c] px-5 py-2 text-[12px] font-semibold text-[#2a1b12]",
            "shadow-[0_6px_14px_rgba(0,0,0,0.18)]",
            "hover:brightness-95 active:translate-y-[1px]",
          ].join(" ")}
        >
          <Plus className="h-4 w-4" />
          Agregar un nuevo producto
        </button>
      </div>
    </section>
  );
}

export default function MainMenuGestion() {
  // Mock para maquetación. Reemplazá con tus datos reales.
  const promos: Row[] = [
    { name: "Trío americana combo", price: "$40.000", stock: "No disponible" },
    { name: "Trío americana combo", price: "$40.000", stock: "Disponible" },
    { name: "Trío americana combo", price: "$40.000", stock: "Disponible" },
  ];

  const burgers: Row[] = [
    { name: "Cheesburger", price: "$10.000", stock: "No disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
  ];

  const sides: Row[] = [
    { name: "Papas burgerli", price: "$10.000", stock: "No disponible" },
    { name: "Papas burgerli", price: "$10.000", stock: "Disponible" },
    { name: "Papas burgerli", price: "$10.000", stock: "Disponible" },
    { name: "Papas burgerli", price: "$10.000", stock: "Disponible" },
  ];

  const drinks: Row[] = [
    { name: "Cheesburger", price: "$10.000", stock: "No disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
    { name: "Cheesburger", price: "$10.000", stock: "Disponible" },
  ];

  const extras: Row[] = [
    { name: "Panceta", price: "$1.200", stock: "No disponible" },
    { name: "Pepinos", price: "$600", stock: "Disponible" },
    { name: "Cheddar", price: "$1.000", stock: "Disponible" },
    { name: "Huevo", price: "$1.400", stock: "Disponible" },
    { name: "Ingresar nombre", price: "Ingresar precio", stock: "Disponible" },
  ];

  return (
    <main className="min-h-screen flex justify-center items-center w-full">
      {/* “Card” central blanca */}
      <div className="w-3/4 px-8 py-8">
        <div className="rounded-md bg-white px-12 py-10 ">
          <h1 className="text-[16px] font-bold text-neutral-900">Gestion del menu</h1>

          <div className="mt-6 space-y-10">
            <Section title="Promos" rows={promos} />
            <Section title="Hamburguesas" rows={burgers} />
            <Section title="Acompañamientos" rows={sides} />
            <Section title="Bebidas" rows={drinks} />
            <Section title="Ingredientes extras" rows={extras} />
          </div>
        </div>
      </div>
    </main>
  );
}
