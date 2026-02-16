"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Send, X } from "lucide-react";
import { toast } from "sonner";
import useProducts from "../hooks/useProducts";
import { useSession } from "../context/SessionContext";

// ─── Types ───────────────────────────────────────────────────────────
type Product = {
  id_burger?: string;
  id_fries?: string;
  id_drinks?: string;
  id_promos?: string;
  name: string;
  price: string | number;
  description?: string;
  main_image?: string;
  image?: string;
  images?: string[];
  size?: string[];
  sizes?: string[];
  size_list?: string[];
  price_list?: string[] | number[];
  options?: number;
  description_list?: string[];
  ingredients?: string[];
};

type CartItem = {
  uid: string; // unique id for cart dedup
  name: string;
  quantity: number;
  price: number;
  size?: string;
  fries?: string;
  sin: string[];
  selectedOptions: string[];
};

type Category = "Promos" | "Hamburguesas" | "Acompañamientos" | "Bebidas";

const FRIES_OPTIONS = [
  { label: "Simples", extra: 0 },
  { label: "Cheddar", extra: 4000 },
  { label: "Cheddar y Panceta", extra: 4300 },
];

const SIZE_PRICES: Record<string, number> = {
  Simple: 0,
  Doble: 1100,
  Triple: 2000,
};

// ─── Component ───────────────────────────────────────────────────────
export default function CreateOrderPage() {
  const { session } = useSession();
  const { getBurgers, getDrinks, getPromos, getFries, createOrder } = useProducts();

  // Products from API
  const [burgers, setBurgers] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Product[]>([]);
  const [sides, setSides] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeCategory, setActiveCategory] = useState<Category>("Hamburguesas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Customer data
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "MercadoPago">("Efectivo");
  const [orderNotes, setOrderNotes] = useState("");

  // Product config dialog
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [configCategory, setConfigCategory] = useState<Category>("Hamburguesas");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFries, setSelectedFries] = useState("Simples");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // ─── Load products ───
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [b, d, p, f] = await Promise.all([
          getBurgers(),
          getDrinks(),
          getPromos(),
          getFries(),
        ]);
        setBurgers(b || []);
        setDrinks(d || []);
        setPromos(p || []);
        setSides(f || []);
      } catch (err) {
        console.error("Error cargando productos:", err);
        toast.error("Error al cargar productos");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Helpers ───
  const getProductsByCategory = (): Product[] => {
    switch (activeCategory) {
      case "Hamburguesas": return burgers;
      case "Bebidas": return drinks;
      case "Promos": return promos;
      case "Acompañamientos": return sides;
      default: return [];
    }
  };

  const getBasePrice = (product: Product): number => {
    const p = product.price;
    return typeof p === "string" ? parseFloat(p) || 0 : p || 0;
  };

  // Display price for a burger = base + cheapest available size increment
  const getBurgerDisplayPrice = (product: Product): number => {
    const base = getBasePrice(product);
    const sizes = getSizes(product);
    if (sizes.length > 0) {
      const minIncrement = Math.min(...sizes.map((s) => SIZE_PRICES[s] ?? 0));
      return base + minIncrement;
    }
    return base;
  };

  // Display price for fries = first price in price_list, or base
  const getFriesDisplayPrice = (product: Product): number => {
    const pl = getPriceList(product);
    if (pl.length > 0) return pl[0];
    return getBasePrice(product);
  };

  const getSizes = (product: Product): string[] => {
    return product.sizes || product.size || product.size_list || [];
  };

  const getPriceList = (product: Product): number[] => {
    const list = product.price_list || [];
    return list.map((v) => (typeof v === "string" ? parseFloat(v) : v));
  };

  const getImageUrl = (product: Product): string | null => {
    return product.main_image || product.image || (product.images && product.images[0]) || null;
  };

  // For display: show the right price per category
  const getDisplayPrice = (product: Product, category: Category): number => {
    if (category === "Hamburguesas") return getBurgerDisplayPrice(product);
    if (category === "Acompañamientos") return getFriesDisplayPrice(product);
    return getBasePrice(product);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ─── Add to cart ───
  const handleProductClick = (product: Product, category: Category) => {
    if (category === "Hamburguesas") {
      // Needs size + fries selection
      setConfigProduct(product);
      setConfigCategory(category);
      const sizes = getSizes(product);
      setSelectedSize(sizes[0] || "Simple");
      setSelectedFries("Simples");
    } else if (category === "Acompañamientos") {
      // Needs type selection (Especiales/Individuales)
      const sizes = getSizes(product);
      if (sizes.length > 1) {
        setConfigProduct(product);
        setConfigCategory(category);
        setSelectedSize(sizes[0] || "");
        setSelectedFries("");
      } else {
        addToCart(product, category);
      }
    } else if (category === "Promos" && product.description_list && product.description_list.length > 0 && product.options && product.options > 0) {
      // Promo with selectable options
      setConfigProduct(product);
      setConfigCategory(category);
      setSelectedSize("");
      setSelectedFries("");
      setSelectedOptions([]);
    } else {
      // Promos without options and Bebidas: add directly
      addToCart(product, category);
    }
  };

  const addToCart = (product: Product, category: Category, size?: string, fries?: string, options?: string[]) => {
    let price = getBasePrice(product);

    if (category === "Hamburguesas") {
      // Burger price = base + size increment + fries extra
      if (size) price += SIZE_PRICES[size] || 0;
      if (fries) {
        const friesOption = FRIES_OPTIONS.find((f) => f.label === fries);
        if (friesOption) price += friesOption.extra;
      }
    } else if (category === "Acompañamientos" && size) {
      // Fries/sides price from price_list
      const sizes = getSizes(product);
      const priceList = getPriceList(product);
      const idx = sizes.indexOf(size);
      if (idx >= 0 && priceList[idx] !== undefined) {
        price = priceList[idx];
      }
    }

    const optionsKey = options && options.length > 0 ? options.sort().join(",") : "";
    const uid = `${product.name}-${size || ""}-${fries || ""}-${optionsKey}`;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.uid === uid);
      if (existing) {
        return prev.map((item) =>
          item.uid === uid ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          uid,
          name: product.name,
          quantity: 1,
          price,
          size: size || undefined,
          fries: fries || undefined,
          sin: [],
          selectedOptions: options || [],
        },
      ];
    });

    toast.success(`${product.name} agregado`);
  };

  const handleConfigConfirm = () => {
    if (!configProduct) return;
    if (configCategory === "Promos" && configProduct.options && configProduct.options > 0) {
      if (selectedOptions.length !== configProduct.options) {
        toast.error(`Seleccioná ${configProduct.options} opción/es`);
        return;
      }
      addToCart(configProduct, configCategory, undefined, undefined, selectedOptions);
    } else {
      addToCart(configProduct, configCategory, selectedSize, selectedFries || undefined);
    }
    setConfigProduct(null);
  };

  const toggleOption = (option: string) => {
    if (!configProduct) return;
    const max = configProduct.options || 1;
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((o) => o !== option);
      }
      if (prev.length >= max) {
        // Replace the oldest selection
        return [...prev.slice(1), option];
      }
      return [...prev, option];
    });
  };

  const updateQuantity = (uid: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.uid === uid ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (uid: string) => {
    setCart((prev) => prev.filter((item) => item.uid !== uid));
  };

  // ─── Submit order ───
  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Agregá al menos un producto");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Ingresá el nombre del cliente");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Ingresá el teléfono del cliente");
      return;
    }
    if (deliveryMode === "delivery" && !customerAddress.trim()) {
      toast.error("Ingresá la dirección para delivery");
      return;
    }

    setSubmitting(true);

    try {
      // Build products array (same format as the real store)
      const products = cart.map((item) =>
        JSON.stringify({
          name: item.name,
          quantity: item.quantity,
          sin: item.sin,
          fries: item.fries || "",
          price: item.price,
          size: item.size || "",
          ...(item.selectedOptions && item.selectedOptions.length > 0 ? { selectedOptions: item.selectedOptions } : {}),
        })
      );

      // Format: "2026-02-16T14:07:35" (sin ms ni Z)
      const createdAt = new Date().toISOString().split(".")[0];

      const orderBody = {
        id_user_client: null,
        payment_method: paymentMethod,
        delivery_mode: deliveryMode,
        price: cartTotal,
        delivery_time: "",
        status: "confirmed",
        order_notes: orderNotes || "",
        local: session?.local || "",
        name: customerName,
        email: customerEmail || "manual@order.com",
        phone: parseInt(customerPhone) || 0,
        address: deliveryMode === "delivery" ? customerAddress : "",
        coupon: null,
        coupon_amount: null,
        created_at:createdAt,
        products,
      };

      console.log("📦 Enviando orden:", JSON.stringify(orderBody, null, 2));

      await createOrder(orderBody);

      toast.success("¡Orden creada exitosamente!");
      setTimeout(() => {
        window.location.href = "/pedidos";
      }, 1000);
      // Reset form
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setOrderNotes("");
      setDeliveryMode("pickup");
      setPaymentMethod("Efectivo");
      setShowCart(false);
    } catch (error) {
      console.error("Error creando orden:", error);
      toast.error("Error al crear la orden");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Categories config ───
  const categories: { key: Category; label: string }[] = [
    { key: "Hamburguesas", label: "Hamburguesas" },
    { key: "Acompañamientos", label: "Acompañamientos" },
    { key: "Promos", label: "Promos" },
    { key: "Bebidas", label: "Bebidas" },
  ];

  if (isLoading) {
    return (
      <main className="flex flex-col justify-start gap-5 text-black pb-10 px-4 md:px-6 lg:ml-72 lg:px-10">
        <h1 className="text-2xl font-bold mt-6">Crear orden manual</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#f2b24c] border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col justify-start gap-5 text-black pb-10 px-4 md:px-6 lg:ml-72 lg:px-10">
      {/* Header */}
      <div className="flex items-center justify-between mt-6">
        <h1 className="text-2xl font-bold">Crear orden manual</h1>
        <button
          onClick={() => setShowCart(true)}
          className="relative bg-[#f2b24c] hover:brightness-95 text-[#2a1b12] font-semibold py-2 px-5 rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Carrito</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === cat.key
                ? "bg-[#3a2a1f] text-white"
                : "bg-[#f3e3bf] text-[#3a2a1f] hover:bg-[#e8d4a8]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getProductsByCategory().map((product, idx) => {
          const img = getImageUrl(product);
          const price = getBasePrice(product);
          return (
            <div
              key={product.id_burger || product.id_fries || product.id_drinks || product.id_promos || idx}
              onClick={() => handleProductClick(product, activeCategory)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100 hover:border-[#f2b24c]"
            >
              {img && (
                <div className="h-40 bg-[#fdf6ec] flex items-center justify-center overflow-hidden">
                  <img
                    src={img}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-sm">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-[#3a2a1f]">
                    ${getDisplayPrice(product, activeCategory).toLocaleString()}
                  </span>
                  <span className="bg-[#f2b24c] text-[#2a1b12] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Agregar
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Product Config Dialog (size, fries) ─── */}
      {configProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{configProduct.name}</h2>
              <button onClick={() => setConfigProduct(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Size Selection */}
            {getSizes(configProduct).length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-[#f2b24c] border-b border-[#f2b24c] pb-1 mb-2">
                  Tamaño
                </h3>
                <div className="space-y-2">
                  {getSizes(configProduct).map((size) => (
                    <label
                      key={size}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-sm">{size}</span>
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                        className="accent-[#f2b24c] h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Fries Selection (only for burgers) */}
            {configCategory === "Hamburguesas" && (
              <div>
                <h3 className="font-semibold text-sm text-[#f2b24c] border-b border-[#f2b24c] pb-1 mb-2">
                  Papas fritas
                </h3>
                <div className="space-y-2">
                  {FRIES_OPTIONS.map((opt) => (
                    <label
                      key={opt.label}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-sm">
                        {opt.label}
                        {opt.extra > 0 && (
                          <span className="text-gray-400 ml-1">(+ ${opt.extra.toLocaleString()})</span>
                        )}
                      </span>
                      <input
                        type="radio"
                        name="fries"
                        value={opt.label}
                        checked={selectedFries === opt.label}
                        onChange={() => setSelectedFries(opt.label)}
                        className="accent-[#f2b24c] h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Options Selection */}
            {configCategory === "Promos" && configProduct.description_list && configProduct.description_list.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-[#f2b24c] border-b border-[#f2b24c] pb-1 mb-2">
                  Opciones (elegí {configProduct.options || 1})
                </h3>
                <div className="space-y-2">
                  {configProduct.description_list.map((opt: string) => (
                    <label
                      key={opt}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="text-sm">{opt}</span>
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(opt)}
                        onChange={() => toggleOption(opt)}
                        className="accent-[#f2b24c] h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConfigConfirm}
              className="w-full bg-[#f2b24c] hover:brightness-95 text-[#2a1b12] font-bold py-3 rounded-full transition-all cursor-pointer"
            >
              Agregar al pedido
            </button>
          </div>
        </div>
      )}

      {/* ─── Cart Sidebar ─── */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCart(false)} />
          <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#FCEDCC] shadow-xl flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between bg-[#3a2a1f] px-5 py-4 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Pedido
              </h2>
              <button onClick={() => setShowCart(false)} className="cursor-pointer hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Cart Items */}
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10">El carrito está vacío</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.uid} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          {item.size && <p className="text-xs text-gray-500">Tamaño: {item.size}</p>}
                          {item.fries && <p className="text-xs text-gray-500">Papas: {item.fries}</p>}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.uid)}
                          className="text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.uid, -1)}
                            className="h-7 w-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.uid, 1)}
                            className="h-7 w-7 flex items-center justify-center bg-[#f2b24c] rounded-full hover:brightness-95 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Form */}
              {cart.length > 0 && (
                <div className="space-y-3 border-t border-[#3a2a1f]/20 pt-4">
                  <h3 className="font-bold text-sm">Datos del cliente</h3>
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  />
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                  />

                  {/* Delivery Mode */}
                  <div>
                    <h3 className="font-bold text-sm mb-2">Entrega</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeliveryMode("pickup")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          deliveryMode === "pickup"
                            ? "bg-[#3a2a1f] text-white"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        Retiro en local
                      </button>
                      <button
                        onClick={() => setDeliveryMode("delivery")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          deliveryMode === "delivery"
                            ? "bg-[#3a2a1f] text-white"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>

                  {deliveryMode === "delivery" && (
                    <input
                      type="text"
                      placeholder="Dirección *"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2b24c]"
                    />
                  )}

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-bold text-sm mb-2">Método de pago</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod("Efectivo")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          paymentMethod === "Efectivo"
                            ? "bg-[#3a2a1f] text-white"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        Efectivo
                      </button>
                      <button
                        onClick={() => setPaymentMethod("MercadoPago")}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          paymentMethod === "MercadoPago"
                            ? "bg-[#3a2a1f] text-white"
                            : "bg-white border border-gray-300"
                        }`}
                      >
                        Mercado Pago
                      </button>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <textarea
                    placeholder="Notas del pedido (opcional)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2b24c] min-h-[60px] resize-none"
                  />
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-[#3a2a1f]/20 px-5 py-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Crear orden
                    </>
                  )}
                </button>
              </div>
            )}
          </aside>
        </>
      )}
    </main>
  );
}
