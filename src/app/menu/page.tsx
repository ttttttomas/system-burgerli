// MainMenuGestion.tsx
// Gestión del menú con diseño responsive mejorado

"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import ProductModal from "../components/ProductModal";
import useProducts from "../hooks/useProducts";

type ProductCategory =
  | "Promos"
  | "Hamburguesas"
  | "Acompañamientos"
  | "Bebidas"
  | "Cupones";

type Row = {
  id?: string;
  id_burger?: string;
  id_fries?: string;
  id_drinks?: string;
  amount?: number;
  id_promos?: string;
  id_coupons?: string;
  options: number;
  name: string;
  price: string;
  stock: boolean | number;
  price_list?: string[];
  main_image?: string;
  image?: string;
  images?: string[];
  description?: string;
  sizes?: string[];
  size?: string[];
  size_list?: string[];
  quantity?: number;
  ingredients?: string[];
  description_list?: string[];
};

interface ProductData {
  id_burger?: string;
  id_fries?: string;
  id_drinks?: string;
  id_promos?: string;
  name: string;
  options: number;
  price: string;
  description: string;
  quantity?: number;
  image?: File | string | null;
  size?: string[];
  size_list?: string[];
  main_image?: File | string | null;
  price_list?: number[];
  ingredients?: string[];
  description_list?: string[];
}

function StockToggle({
  value,
  onChange,
}: {
  value: boolean | number;
  onChange: () => void;
}) {
  const isAvailable = value === true || value === 1;

  return (
    <button
      onClick={onChange}
      className={[
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-medium transition-all cursor-pointer",
        isAvailable
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-red-100 text-red-700 hover:bg-red-200",
      ].join(" ")}
      type="button"
    >
      <span
        className={[
          "h-2 w-2 rounded-full flex-shrink-0",
          isAvailable ? "bg-green-500" : "bg-red-500",
        ].join(" ")}
      />
      <span>{isAvailable ? "Disponible" : "No disponible"}</span>
    </button>
  );
}

function Section({
  title,
  rows,
  onEdit,
  onDelete,
  onAdd,
  onToggleStock,
}: {
  title: string;
  rows: Row[];
  onEdit: (row: Row, index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  onToggleStock: (index: number) => void;
}) {
  
  return (
    <section className="space-y-3 w-full">
      <h2 className="text-[14px] sm:text-[15px] font-semibold text-neutral-800 px-1">
        {title}
      </h2>

      {/* Estado vacío para Cupones */}
      {title === "Promos" && (!rows || rows.length === 0) || title === "Cupones" && (!rows || rows.length === 0) && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-[#f3e3bf] rounded-lg border border-[#3a2a1f]/25">
          <p className="text-neutral-600 text-center mb-4 text-sm sm:text-base">
            Todavía no hay {title.toLowerCase()} agregados
          </p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 bg-[#f2b24c] hover:brightness-95 text-[#2a1b12] font-semibold py-2 px-6 rounded-full transition-all shadow-sm"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Agregar cupón
          </button>
        </div>
      )}

      {/* Vista de tabla para desktop */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-[#3a2a1f]/25">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-[#3a2a1f] text-white">
            <tr>
              <th className="px-3 lg:px-4 py-2 font-semibold whitespace-nowrap">
                Nombre
              </th>
              <th className="px-3 lg:px-4 py-2 font-semibold whitespace-nowrap">
                Precio
              </th>
              <th className="px-3 lg:px-4 py-2 font-semibold text-center whitespace-nowrap">
                Acciones
              </th>
              {/* <th className="px-3 lg:px-4 py-2 font-semibold text-right whitespace-nowrap">
                Stock
              </th> */}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={`${r.name}-${idx}`}
                className="bg-[#f3e3bf] text-neutral-800 border-t border-[#3a2a1f]/15 hover:bg-[#f0ddb0] transition-colors"
              >
                <td className="px-3 lg:px-4 py-2.5">{r.name}</td>
                <td className="px-3 lg:px-4 py-2.5 font-medium">
                  ${r.price || r.price_list?.[0] || r.amount}.00
                </td>

                <td className="px-3 lg:px-4 py-2.5">
                  <div className="flex items-center justify-center gap-2">
                    {title !== "Cupones" && 
                    <button
                      onClick={() => onEdit(r, idx)}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 transition-colors p-1 hover:bg-green-100 rounded"
                      type="button"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="font-medium hidden lg:inline">
                        Editar
                      </span>
                    </button>}

                    <button
                      onClick={() => onDelete(idx)}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded"
                      type="button"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="font-medium hidden lg:inline">
                        Eliminar
                      </span>
                    </button>
                  </div>
                </td>
                
                {/* <td className="px-3 lg:px-4 py-2.5 text-right">
                  <div className="flex justify-end">
                    <StockToggle
                      value={r.stock}
                      onChange={() => onToggleStock(idx)}
                    />
                  </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de cards para móvil */}
      <div className="sm:hidden space-y-2">
        {rows.map((r, idx) => (
          <div
            key={`${r.name}-mobile-${idx}`}
            className="bg-[#f3e3bf] rounded-lg border border-[#3a2a1f]/25 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[13px] text-neutral-800 truncate">
                  {r.name}
                </h3>
                <p className="text-[13px] font-medium text-neutral-700 mt-0.5">
                  ${r.price || r.price_list?.[0]}.00
                </p>
              </div>
             {/* <StockToggle
                value={r.stock}
                onChange={() => onToggleStock(idx)}
              /> */}
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-[#3a2a1f]/15">
              <button
                onClick={() => onEdit(r, idx)}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 text-green-700 hover:text-green-800 transition-colors py-1.5 px-3 hover:bg-green-100 rounded text-[12px] font-medium"
                type="button"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>

              <button
                onClick={() => onDelete(idx)}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 text-red-600 hover:text-red-700 transition-colors py-1.5 px-3 hover:bg-red-100 rounded text-[12px] font-medium"
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onAdd}
          type="button"
          className={[
            "inline-flex items-center gap-2 rounded-full cursor-pointer",
            "bg-[#f2b24c] px-4 sm:px-5 py-2 text-[11px] sm:text-[12px] font-semibold text-[#2a1b12]",
            "shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
            "hover:brightness-95 active:translate-y-[1px] transition-all",
          ].join(" ")}
        >
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap">Agregar nuevo producto</span>
        </button>
      </div>
      </section>
  );
}

export default function MainMenuGestion() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ProductCategory>("Promos");
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { getBurgers, getDrinks, getPromos, getFries, getCoupons } =
    useProducts();
  const [burgers, setBurgers] = useState<Row[]>([]);
  const [drinks, setDrinks] = useState<Row[]>([]);
  const [promos, setPromos] = useState<Row[]>([]);
  const [sides, setSides] = useState<Row[]>([]);
  const [coupons, setCoupons] = useState<Row[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        const [burgersData, drinksData, promosData, friesData, couponsData] =
          await Promise.all([
            getBurgers(),
            getDrinks(),
            getPromos(),
            getFries(),
            getCoupons(),
          ]);
        setBurgers(burgersData);
        setDrinks(drinksData);
        setPromos(promosData);
        setSides(friesData);
        setCoupons(couponsData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getProducts();
  }, []);

  const handleOpenModal = (category: ProductCategory, product?: Row) => {
    setCurrentCategory(category);
    if (product) {
      // Convertir Row a ProductData para edición
      // Para Promos usar 'image', para otras categorías usar 'main_image'
      const imageUrl =
        category === "Promos"
          ? product.image || null
          : product.main_image || (product.images && product.images[0]) || null;

      // Manejar size/size_list - puede venir como "size" o "size_list"
      const sizes = product.sizes || product.size || product.size_list || [];

      setEditingProduct({
        id_burger: product.id_burger,
        id_fries: product.id_fries,
        id_drinks: product.id_drinks,
        id_promos: product.id_promos,
        options: product.options,
        name: product.name,
        price: product.price,
        description: product.description || "",
        quantity: product.quantity,
        image: imageUrl,
        main_image: imageUrl,
        size: sizes,
        size_list: sizes,
        price_list:
          product.price_list?.map((p) =>
            typeof p === "string" ? parseFloat(p) : p,
          ) || [],
        ingredients: product.ingredients || [],
        description_list: product.description_list || [],
      });
    } else {
      setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (data: ProductData) => {
    try {
      // Determinar si es CREATE o UPDATE
      const isEditing = !!(
        data.id_burger ||
        data.id_fries ||
        data.id_drinks ||
        data.id_promos
      );

      let endpoint = "";
      let method = "";
      let body: any;

      if (isEditing) {
        // ==================== UPDATE (PUT con JSON) ====================
        method = "PUT";

        // Obtener el ID correcto según la categoría
        let productId = "";
        switch (currentCategory) {
          case "Hamburguesas":
            productId = data.id_burger || "";
            endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/update_burger/${productId}`;
            break;
          case "Acompañamientos":
            productId = data.id_fries || "";
            endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/update_fries/${productId}`;
            break;
          case "Bebidas":
            productId = data.id_drinks || "";
            endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/update_drinks/${productId}`;
            break;
          case "Promos":
            productId = data.id_promos || "";
            endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/update_promos/${productId}?promo_id=${data.id_promos}`;
            break;
        }

        // Construir el body JSON según la categoría
        if (currentCategory === "Hamburguesas") {
          body = {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: true, // Siempre true al editar
            size: data.size || [],
            ingredients: data.ingredients || [],
            main_image:
              typeof data.main_image === "string"
                ? data.main_image
                : data.main_image || "",
          };
        } else if (currentCategory === "Acompañamientos") {
          body = {
            name: data.name,
            stock: true,
            size_list: data.size_list || data.size || [],
            description_list: data.description_list || [],
            price_list: data.price_list || [],
            main_image:
              typeof data.main_image === "string"
                ? data.main_image
                : data.main_image || "",
          };
        } else if (currentCategory === "Bebidas") {
          body = {
            name: data.name,
            price: parseFloat(data.price),
            stock: true,
            size_list: data.size_list || data.size || [],
            main_image:
              typeof data.main_image === "string"
                ? data.main_image
                : data.main_image || "",
          };
        } else if (currentCategory === "Promos") {
          body = {
            name: data.name,
            description: data.description || "",
            quantity:
              typeof data.quantity === "number"
                ? data.quantity
                : parseInt(data.quantity || "0") || 0,
            price: parseFloat(data.price),
            stock: true,
            image: (typeof data.image === "string" ? data.image : "") || "",
            description_list: data.description_list || [],
            stock_by_local: {
              gerli: true,
              wilde: true,
              lanus: true,
            },
          };
        }
      } else {
        // ==================== CREATE (POST con FormData) ====================
        method = "POST";

        switch (currentCategory) {
          case "Hamburguesas":
            endpoint =
              "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/burgers";
            break;
          case "Acompañamientos":
            endpoint =
              "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/fries";
            break;
          case "Bebidas":
            endpoint =
              "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/drinks";
            break;
          case "Promos":
            endpoint =
              "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/promos";
            break;
          case "Cupones":
            endpoint =
              "https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/create_coupon";
            break;
        }

        const formData = new FormData();
        // Agregar campos específicos según categoría
        if (currentCategory === "Hamburguesas") {
          if (data.image && data.image instanceof File) {
            formData.append("main_image", data.image);
          }
          formData.append("name", data.name);
          formData.append("description", data.description);
          formData.append("stock", "1");
          formData.append("price", data.price);
          data.size?.forEach((size) => {
            formData.append("size", size);
          });
          data.ingredients?.forEach((ingredient) => {
            formData.append("ingredients", ingredient);
          });
        } else if (currentCategory === "Acompañamientos") {
          formData.append("name", data.name);
          formData.append("stock", "true");

          if (data.image && data.image instanceof File) {
            formData.append("main_image", data.image);
          }
          // API espera: size, description, price (sin _list)
          // El modal usa 'size', pero puede venir como 'size_list' también
          const sizes = data.size || data.size_list || [];
          sizes.forEach((size) => {
            formData.append("size", size);
          });
          data.description_list?.forEach((description) => {
            formData.append("description", description);
          });
          data.price_list?.forEach((price) => {
            formData.append("price", price.toString());
          });
        } else if (currentCategory === "Bebidas") {
          formData.append("name", data.name);
          formData.append("price", data.price);
          formData.append("stock", "true");

          // Buscar imagen en ambos campos posibles
          if (data.image && data.image instanceof File) {
            formData.append("main_image", data.image);
          }

          if (data.size) {
            data.size.forEach((size) => {
              formData.append("size", size);
            });
          }
        } else if (currentCategory === "Promos") {
          formData.append("name", data.name ?? "");
          formData.append("options", data.options ?.toString() || "1");
          formData.append("stock", "1".toString());
          formData.append("description", data.description ?? "");
          formData.append("quantity", String(Number(data.quantity || 1)));
          formData.append("price", String(Number(data.price || 0)));

          if (!(data.image instanceof File)) {
            throw new Error("Tenés que seleccionar una imagen (File).");
          }
          formData.append("image", data.image);
          
          const list = (data.description_list ?? []).map(s => s.trim()).filter(Boolean);
          for (const item of list) formData.append("description_list", item);
          
        }
        
        // Cupones usa JSON en lugar de FormData
        if (currentCategory === "Cupones") {
          body = JSON.stringify({
            name: data.name,
            amount: Number(data.price || 0),
          });
        } else {
          body = formData;
        }
      }

      // Hacer la petición
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        ...(isEditing
          ? {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          : currentCategory === "Cupones"
            ? {
                headers: {
                  "Content-Type": "application/json",
                },
                body,
              }
            : { body }),
      });

      if (!response.ok) {
        throw new Error(
          isEditing
            ? "Error al actualizar el producto"
            : "Error al crear el producto",
        );
      }

      await response.json();

      // Cerrar el modal
      handleCloseModal();
      setTimeout(() => {
        // Actualizar el estado local
        setIsLoading(false);
        window.location.reload();
      }, 1000);

      // Mostrar mensaje de éxito
      alert("Producto creado exitosamente");
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    }
  };

  const handleDeleteProduct = async (
    category: ProductCategory,
    index: number,
  ) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este producto?",
    );
    if (!confirmed) return;

    try {
      // Obtener el producto y su ID según la categoría
      let product: Row | undefined;
      let productId: string = "";
      let endpoint: string = "";

      switch (category) {
        case "Promos":
          product = promos[index];
          productId = product?.id_promos || "";
          endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/delete_promos/${productId}`;
          break;
        case "Hamburguesas":
          product = burgers[index];
          productId = product?.id_burger || "";
          endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/delete_burgers/${productId}`;
          break;
        case "Acompañamientos":
          product = sides[index];
          productId = product?.id_fries || "";
          endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/delete_fries/${productId}`;
          break;
        case "Bebidas":
          product = drinks[index];
          productId = product?.id_drinks || "";
          endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/delete_drinks/${productId}`;
          break;
        case "Cupones":
          product = coupons[index];
          productId = product?.id || "";
          endpoint = `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/delete_coupon/${productId}`;
          break;
      }

      if (!productId) {
        alert("Error: No se pudo obtener el ID del producto");
        return;
      }

      // Hacer la petición DELETE
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      alert("Producto eliminado exitosamente");

      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el producto");
    }
  };

  const handleToggleStock = async (
    category: ProductCategory,
    index: number,
  ) => {
    console.log("Cambiando stock:", category, index);

    // Obtener el producto según la categoría
    let product: Row | undefined;
    switch (category) {
      case "Promos":
        product = promos[index];
        break;
      case "Hamburguesas":
        product = burgers[index];
        break;
      case "Acompañamientos":
        product = sides[index];
        break;
      case "Bebidas":
        product = drinks[index];
        break;
    }

    if (!product) {
      console.error("Producto no encontrado");
      return;
    }

    // Obtener el ID según la categoría
    let productId: string | undefined;
    switch (category) {
      case "Hamburguesas":
        productId = product.id_burger;
        break;
      case "Acompañamientos":
        productId = product.id_fries;
        break;
      case "Bebidas":
        productId = product.id_drinks;
        break;
      case "Promos":
        productId = product.id_promos;
        break;
    }

    if (!productId) {
      console.error("Producto sin ID para la categoría:", category);
      return;
    }

    console.log(productId);

    try {
      // Llamar al endpoint PATCH con el ID del producto
      const newStockValue = product.stock === 1 ? false : true;

      const response = await fetch(
        `https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api/products/${productId}/stock`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ stock: newStockValue }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el stock");
      }

      // Actualizar el estado local solo si la petición fue exitosa
      const updateStock = (items: Row[]) => {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          stock: newItems[index].stock === 1 ? 0 : 1,
        };
        return newItems;
      };

      switch (category) {
        case "Promos":
          setPromos(updateStock(promos));
          break;
        case "Hamburguesas":
          setBurgers(updateStock(burgers));
          break;
        case "Acompañamientos":
          setSides(updateStock(sides));
          break;
        case "Bebidas":
          setDrinks(updateStock(drinks));
          break;
      }
    } catch (error) {
      console.error("Error al cambiar el stock:", error);
      alert("Error al cambiar el stock del producto");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:pl-80">
        <div className="max-w-8xl mx-auto">
          <div className="rounded-xl px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#f2b24c]"></div>
              <p className="text-lg font-semibold text-neutral-700">
                Cargando productos...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:pl-80">
      {/* Contenedor principal con mejor responsive */}
      <div className="max-w-8xl mx-auto">
        <div className="rounded-xl px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
          {/* Header mejorado */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-[18px] sm:text-[20px] lg:text-[30px] font-extrabold text-neutral-900">
              Gestión del Menú
            </h1>
          </div>

          {/* Secciones con mejor espaciado */}
          <div className="space-y-8 sm:space-y-10">
            <Section
              title="Promos"
              rows={promos}
              onEdit={(row) => handleOpenModal("Promos", row)}
              onDelete={(index) => handleDeleteProduct("Promos", index)}
              onAdd={() => handleOpenModal("Promos")}
              onToggleStock={(index) => handleToggleStock("Promos", index)}
            />
            <Section
              title="Hamburguesas"
              rows={burgers}
              onEdit={(row) => handleOpenModal("Hamburguesas", row)}
              onDelete={(index) => handleDeleteProduct("Hamburguesas", index)}
              onAdd={() => handleOpenModal("Hamburguesas")}
              onToggleStock={(index) =>
                handleToggleStock("Hamburguesas", index)
              }
            />
            <Section
              title="Acompañamientos"
              rows={sides}
              onEdit={(row) => handleOpenModal("Acompañamientos", row)}
              onDelete={(index) =>
                handleDeleteProduct("Acompañamientos", index)
              }
              onAdd={() => handleOpenModal("Acompañamientos")}
              onToggleStock={(index) =>
                handleToggleStock("Acompañamientos", index)
              }
            />
            <Section
              title="Bebidas"
              rows={drinks}
              onEdit={(row) => handleOpenModal("Bebidas", row)}
              onDelete={(index) => handleDeleteProduct("Bebidas", index)}
              onAdd={() => handleOpenModal("Bebidas")}
              onToggleStock={(index) => handleToggleStock("Bebidas", index)}
            />
            <Section
              title="Cupones"
              rows={coupons}
              onEdit={(row) => handleOpenModal("Cupones", row)}
              onDelete={(index) => handleDeleteProduct("Cupones", index)}
              onAdd={() => handleOpenModal("Cupones")}
              onToggleStock={(index) => handleToggleStock("Cupones", index)}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        category={currentCategory}
        initialData={editingProduct}
      />
    </main>
  );
}
