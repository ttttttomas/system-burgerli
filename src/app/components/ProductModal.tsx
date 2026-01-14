"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";

type ProductCategory =
  | "Promos"
  | "Hamburguesas"
  | "Acompañamientos"
  | "Bebidas"
  | "Cupones";
interface ProductData {
  id_burger?: string;
  id_fries?: string;
  id_drinks?: string;
  id_promos?: string;
  name: string;
  price: string;
  description: string;
  options: number;
  image?: File | string | null;
  size?: string[];
  size_list?: string[];
  price_list?: number[];
  ingredients?: string[];
  description_list?: string[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductData) => Promise<void>;
  category: ProductCategory;
  initialData?: ProductData | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  category,
  initialData,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    price: "",
    description: "",
    options: 0,
    image: null,
    size_list: [],
    size: [],
    price_list: [],
    ingredients: [],
    description_list: [],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newDescriptionItem, setNewDescriptionItem] = useState("");

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        // Si la imagen es una URL string, mostrarla en el preview
        if (initialData.image && typeof initialData.image === "string") {
          setImagePreview(initialData.image);
        }
      } else {
        // Inicializar según categoría
        const defaultData: ProductData = {
          name: "",
          price: "",
          options: 0,
          description: "",
          image: null,
        };

        if (category === "Hamburguesas") {
          defaultData.size = ["Simple", "Doble", "Triple"];
          defaultData.ingredients = [];
        } else if (category === "Acompañamientos") {
          defaultData.size = ["Especiales", "Individuales"];
          defaultData.price_list = [0, 0];
        } else if (category === "Bebidas") {
          defaultData.size = ["Chica", "Grande"];
        } else if (category === "Promos") {
          defaultData.description_list = [];
        }

        setFormData(defaultData);
        setImagePreview(null);
      }
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSize = () => {
    const newFormData: ProductData = {
      ...formData,
      size: [...(formData.size || []), ""],
    };

    // Solo agregar precio si es Acompañamientos
    if (category === "Acompañamientos") {
      newFormData.price_list = [...(formData.price_list || []), 0];
    }

    setFormData(newFormData);
  };

  const handleRemoveSize = (index: number) => {
    const newsize = formData.size?.filter((_, i) => i !== index);
    const newFormData: ProductData = { ...formData, size: newsize };

    // Solo remover precio si es Acompañamientos
    if (category === "Acompañamientos") {
      const newprices = formData.price_list?.filter((_, i) => i !== index);
      newFormData.price_list = newprices;
    }

    setFormData(newFormData);
  };

  const handleSizeChange = (index: number, value: string) => {
    const newsize = [...(formData.size || [])];
    newsize[index] = value;
    setFormData({ ...formData, size: newsize });
  };

  const handlePriceChange = (index: number, value: string) => {
    const newprices = [...(formData.price_list || [])];
    newprices[index] = value ? parseFloat(value) : 0;
    setFormData({ ...formData, price_list: newprices });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), ""],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = formData.ingredients?.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddDescriptionItem = () => {
    const item = newDescriptionItem.trim();
    if (!item) return;

    setFormData((prev) => {
      const next = {
        ...prev,
        description_list: [...(prev.description_list ?? []), item],
      };

      console.log("Adding item:", item, "Next list:", next.description_list);
      return next;
    });

    setNewDescriptionItem("");
  };

  const handleRemoveDescriptionItem = (index: number) => {
    const newList = formData.description_list?.filter((_, i) => i !== index);
    setFormData({ ...formData, description_list: newList });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si hay un item pendiente en el input, agregarlo automáticamente
    let finalFormData = formData;
    if (category === "Promos" && newDescriptionItem.trim()) {
      finalFormData = {
        ...formData,
        description_list: [
          ...(formData.description_list || []),
          newDescriptionItem.trim(),
        ],
      };
      setNewDescriptionItem("");
    }

    // Validación básica
    if (!formData.name.trim()) {
      alert("El nombre del producto es obligatorio");
      return;
    }

    // Validar precio según categoría
    if (category !== "Acompañamientos") {
      const priceStr = String(formData.price || "");
      if (!priceStr.trim()) {
        alert("El precio del producto es obligatorio");
        return;
      }
    }

    // Confirmación
    const action = initialData ? "editar" : "agregar";
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas ${action} este producto?`,
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            {initialData ? "Editar" : "Agregar"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Principal */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Información principal
            </h3>

            <div className={`grid grid-cols-1 ${category !== "Cupones" ? "lg:grid-cols-2" : ""} gap-6`}>
              {/* Área de imagen - Oculta para Cupones */}
              {category !== "Cupones" && (
              <div>
                <label className="block mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <div className="border-2 border-dashed border-[#5a4a3a] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center ">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={300}
                          className="object-contain mx-auto rounded"
                        />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-[#5a4a3a] " />
                        <span className="text-sm text-[#5a4a3a]">
                          Click para subir imagen
                        </span>
                      </>
                    )}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  className="w-full mt-3 bg-[#f2b24c] hover:brightness-95 text-[#2a1b12] font-semibold py-2 px-4 rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar una foto
                </button>
              </div>
              )}

              {/* Campos de texto */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  required
                />

                {category !== "Acompañamientos" && (
                  <>
                  {category === "Hamburguesas" && <p className="text-sm text-gray-500">Precio del producto base (Tamaño simple)</p>}
                  <input
                    type="text"
                    placeholder="Precio del producto base"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                    required
                  />
                  </>
                )}

                {/* Campos específicos de Promos */}
                {category === "Promos" && (
                  <>
                  <p className="text-sm text-gray-500">Maximo de opciones seleccionables</p>
                  <input
                    type="number"
                    placeholder="Máximo de opciones seleccionables"
                    value={formData.options}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        options: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  />
                  </>
                )}
                
                {category !== "Cupones" && (
                  <textarea
                    placeholder="Descripcion del producto"
                    value={formData.description || formData.description_list?.join("\n")}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c] min-h-[120px] resize-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sección de Tamaños para Hamburguesas, Acompañamientos y Bebidas */}
          {(category === "Hamburguesas" ||
            category === "Acompañamientos" ||
            category === "Bebidas") && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Tamaños
              </h3>
              <div className="space-y-3">
                {formData.size?.map((size, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Ingrese tamaño"
                      value={size}
                      onChange={(e) => handleSizeChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                    />
                    {/* Solo mostrar input de precio para Acompañamientos */}
                    {category === "Acompañamientos" && (
                      <input
                        type="number"
                        placeholder="Precio"
                        value={formData.price_list?.[index] || ""}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        className="w-32 px-4 py-2 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSize}
                  className="w-full border-2 border-dashed border-[#5a4a3a] rounded-lg py-3 text-[#5a4a3a] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar un nuevo tamaño
                </button>
              </div>
            </div>
          )}

          {/* Sección de Ingredientes para Hamburguesas */}
          {category === "Hamburguesas" && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Ingredientes
              </h3>
              <div className="space-y-3">
                {formData.ingredients?.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del ingrediente"
                      value={ingredient}
                      onChange={(e) =>
                        handleIngredientChange(index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full border-2 border-dashed border-[#5a4a3a] rounded-lg py-3 text-[#5a4a3a] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar un ingrediente
                </button>
              </div>
            </div>
          )}
         
          {/* Sección de Lista de Descripciones para Promos */}
          {category === "Promos" && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Lista de opciones (Opcional)
              </h3>
              <div className="space-y-3">
                {formData.description_list?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#5a4a3a] text-white px-4 py-2 rounded-lg"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDescriptionItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar producto a la lista"
                    value={newDescriptionItem}
                    onChange={(e) => setNewDescriptionItem(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#5a4a3a] text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDescriptionItem}
                    className="bg-[#f2b24c] hover:brightness-95 text-[#2a1b12] font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Botón de submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f2b24c] hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed text-[#2a1b12] font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#2a1b12]"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {initialData ? "Guardar cambios" : "Agregar nuevo producto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
