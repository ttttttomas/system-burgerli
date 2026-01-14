"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "../context/SessionContext";
import { Orders } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Tipos para los datos procesados
interface ProductStats {
  name: string;
  price: number;
  quantity: number;
  revenue: number;
  percentageOfTotal: number;
  previousPeriodQuantity: number;
  variationPercentage: number;
}

interface Metrics {
  totalSales: number;
  totalRevenue: number;
  growth: number;
  previousTotalSales: number;
  previousTotalRevenue: number;
}

type FilterType = "week" | "month" | "year";

interface ChartDataPoint {
  name: string;
  currentPeriod: number;
  previousPeriod: number;
}

type SortField = "name" | "price" | "quantity" | "revenue" | "percentage" | "variation";
type SortDirection = "asc" | "desc";

export default function AdminPage() {
  const { orders: getOrders, locals: getLocals } = useSession();
  const [allOrders, setAllOrders] = useState<Orders[]>([]);
  const [availableLocals, setAvailableLocals] = useState<string[]>([]);
  const [selectedLocal, setSelectedLocal] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("week");
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Cargar todas las órdenes y locales al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar órdenes
        const ordersData = await getOrders();
        console.log("📦 Órdenes cargadas:", ordersData);
        
        // Debug: Ver estructura de productos en la primera orden
        if (ordersData && ordersData.length > 0) {
          console.log("🔍 Primera orden completa:", ordersData[0]);
          console.log("🔍 Productos de la primera orden:", ordersData[0].products);
          console.log("🔍 Tipo de products:", typeof ordersData[0].products);
        }
        
        setAllOrders(ordersData || []);
        
        // Cargar locales disponibles
        const localsData = await getLocals();
        console.log("🏪 Locales cargados:", localsData);
        
        // Extraer solo los nombres de los locales
        const localNames = Array.isArray(localsData) 
          ? localsData.map((local: any) => local.name || local)
          : [];
        console.log("🏪 Nombres de locales extraídos:", localNames);
        setAvailableLocals(localNames);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        setAllOrders([]);
        setAvailableLocals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para parsear productos de una orden
  const parseProducts = (productsData: any): any[] => {
    try {
      // Si es un array, procesar cada elemento
      if (Array.isArray(productsData)) {
        return productsData.map((item) => {
          // Si el elemento es un string, parsearlo como JSON
          if (typeof item === "string") {
            try {
              return JSON.parse(item);
            } catch (e) {
              console.error("Error parseando producto string:", e, item);
              return null;
            }
          }
          // Si ya es un objeto, devolverlo directamente
          return item;
        }).filter(Boolean); // Filtrar nulls
      }
      
      // Si es un string, intentar parsearlo como JSON
      if (typeof productsData === "string") {
        const parsed = JSON.parse(productsData);
        // Si el resultado es un array, procesarlo recursivamente
        if (Array.isArray(parsed)) {
          return parseProducts(parsed);
        }
        return [parsed];
      }
      
      // Si es un objeto, convertirlo a array
      if (typeof productsData === "object" && productsData !== null) {
        return [productsData];
      }
      
      return [];
    } catch (error) {
      console.error("Error parseando productos:", error, productsData);
      return [];
    }
  };

  // Función para obtener el rango de fechas según el filtro
  const getDateRange = (filter: FilterType) => {
    const now = new Date();
    const currentStart = new Date();
    const previousStart = new Date();
    const previousEnd = new Date();

    switch (filter) {
      case "week":
        currentStart.setDate(now.getDate() - 7);
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;
      case "month":
        currentStart.setDate(now.getDate() - 30);
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
        break;
      case "year":
        currentStart.setDate(now.getDate() - 365);
        previousStart.setDate(now.getDate() - 730);
        previousEnd.setDate(now.getDate() - 365);
        break;
    }

    return {
      current: { start: currentStart, end: now },
      previous: { start: previousStart, end: previousEnd },
    };
  };

  // Filtrar órdenes por local
  const filterOrdersByLocal = (orders: Orders[]): Orders[] => {
    if (selectedLocal === "all") {
      return orders;
    }
    return orders.filter((order) => order.local === selectedLocal);
  };

  // Filtrar órdenes por rango de fechas
  const filterOrdersByDateRange = (
    orders: Orders[],
    startDate: Date,
    endDate: Date
  ): Orders[] => {
    return orders.filter((order) => {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Calcular métricas usando useMemo para optimizar
  const metrics = useMemo((): Metrics => {
    const dateRange = getDateRange(selectedFilter);
    
    // Primero filtrar por local, luego por fecha
    const localFilteredOrders = filterOrdersByLocal(allOrders);

    const currentOrders = filterOrdersByDateRange(
      localFilteredOrders,
      dateRange.current.start,
      dateRange.current.end
    );

    const previousOrders = filterOrdersByDateRange(
      localFilteredOrders,
      dateRange.previous.start,
      dateRange.previous.end
    );

    const totalSales = currentOrders.length;
    const previousTotalSales = previousOrders.length;

    const totalRevenue = currentOrders.reduce(
      (sum, order) => sum + (order.price || 0),
      0
    );
    const previousTotalRevenue = previousOrders.reduce(
      (sum, order) => sum + (order.price || 0),
      0
    );

    const growth =
      previousTotalSales > 0
        ? ((totalSales - previousTotalSales) / previousTotalSales) * 100
        : 0;

    return {
      totalSales,
      totalRevenue,
      growth,
      previousTotalSales,
      previousTotalRevenue,
    };
  }, [allOrders, selectedFilter, selectedLocal]);

  // Calcular estadísticas de productos
  const productStats = useMemo((): ProductStats[] => {
    const dateRange = getDateRange(selectedFilter);
    
    // Primero filtrar por local, luego por fecha
    const localFilteredOrders = filterOrdersByLocal(allOrders);

    const currentOrders = filterOrdersByDateRange(
      localFilteredOrders,
      dateRange.current.start,
      dateRange.current.end
    );

    const previousOrders = filterOrdersByDateRange(
      localFilteredOrders,
      dateRange.previous.start,
      dateRange.previous.end
    );

    // Agregar productos del período actual
    const currentProductsMap = new Map<string, ProductStats>();

    currentOrders.forEach((order) => {
      const products = parseProducts(order.products);
      
      products.forEach((product: any) => {
        // Extraer el nombre del producto, considerando diferentes formatos
        let productName = product.name || product.nombre || product.product_name;
        
        // Si el producto tiene tamaño, agregarlo al nombre para diferenciarlo
        if (product.size) {
          productName = `${productName} (${product.size})`;
        }
        
        // Si aún no tiene nombre, usar un identificador genérico
        if (!productName) {
          productName = "Producto sin nombre";
          console.warn("Producto sin nombre encontrado:", product);
        }
        
        const price = product.price || 0;
        const quantity = product.quantity || 1;

        if (currentProductsMap.has(productName)) {
          const existing = currentProductsMap.get(productName)!;
          existing.quantity += quantity;
          existing.revenue += price * quantity;
        } else {
          currentProductsMap.set(productName, {
            name: productName,
            price,
            quantity,
            revenue: price * quantity,
            percentageOfTotal: 0,
            previousPeriodQuantity: 0,
            variationPercentage: 0,
          });
        }
      });
    });

    // Agregar productos del período anterior
    const previousProductsMap = new Map<string, number>();

    previousOrders.forEach((order) => {
      const products = parseProducts(order.products);
      
      products.forEach((product: any) => {
        // Usar la misma lógica de nombre que en el período actual
        let productName = product.name || product.nombre || product.product_name;
        
        if (product.size) {
          productName = `${productName} (${product.size})`;
        }
        
        if (!productName) {
          productName = "Producto sin nombre";
        }
        
        const quantity = product.quantity || 1;

        previousProductsMap.set(
          productName,
          (previousProductsMap.get(productName) || 0) + quantity
        );
      });
    });

    // Calcular porcentajes y variaciones
    const totalRevenue = metrics.totalRevenue;
    const productsArray = Array.from(currentProductsMap.values());

    productsArray.forEach((product) => {
      product.percentageOfTotal =
        totalRevenue > 0 ? (product.revenue / totalRevenue) * 100 : 0;

      product.previousPeriodQuantity =
        previousProductsMap.get(product.name) || 0;

      if (product.previousPeriodQuantity > 0) {
        product.variationPercentage =
          ((product.quantity - product.previousPeriodQuantity) /
            product.previousPeriodQuantity) *
          100;
      } else {
        product.variationPercentage = product.quantity > 0 ? 100 : 0;
      }
    });

    // Aplicar ordenamiento según el campo seleccionado
    const sortedArray = [...productsArray].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "revenue":
          comparison = a.revenue - b.revenue;
          break;
        case "percentage":
          comparison = a.percentageOfTotal - b.percentageOfTotal;
          break;
        case "variation":
          comparison = a.variationPercentage - b.variationPercentage;
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sortedArray;
  }, [allOrders, selectedFilter, selectedLocal, metrics.totalRevenue, sortField, sortDirection]);

  // Función para manejar el cambio de ordenamiento
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar la dirección
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Si es un campo nuevo, ordenar descendente por defecto (excepto nombre)
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return "↕️";
    }
    return sortDirection === "asc" ? "▲" : "▼";
  };

  // Preparar datos para el gráfico
  const chartData = useMemo((): ChartDataPoint[] => {
    const dateRange = getDateRange(selectedFilter);
    const data: ChartDataPoint[] = [];
    
    // Filtrar por local primero
    const localFilteredOrders = filterOrdersByLocal(allOrders);

    // Determinar el número de puntos según el filtro
    let points = 7;
    let interval = 1; // días

    if (selectedFilter === "month") {
      points = 30;
      interval = 1;
    } else if (selectedFilter === "year") {
      points = 12;
      interval = 30; // aproximadamente meses
    }

    for (let i = 0; i < points; i++) {
      const currentDate = new Date(dateRange.current.end);
      currentDate.setDate(currentDate.getDate() - (points - 1 - i) * interval);

      const previousDate = new Date(dateRange.previous.end);
      previousDate.setDate(previousDate.getDate() - (points - 1 - i) * interval);

      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + interval);

      const prevNextDate = new Date(previousDate);
      prevNextDate.setDate(prevNextDate.getDate() + interval);

      const currentDayOrders = filterOrdersByDateRange(
        localFilteredOrders,
        currentDate,
        nextDate
      );
      const previousDayOrders = filterOrdersByDateRange(
        localFilteredOrders,
        previousDate,
        prevNextDate
      );

      const currentRevenue = currentDayOrders.reduce(
        (sum, order) => sum + (order.price || 0),
        0
      );
      const previousRevenue = previousDayOrders.reduce(
        (sum, order) => sum + (order.price || 0),
        0
      );

      let label = "";
      if (selectedFilter === "week") {
        label = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][currentDate.getDay()];
      } else if (selectedFilter === "month") {
        label = `${currentDate.getDate()}`;
      } else {
        label = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ][currentDate.getMonth()];
      }

      data.push({
        name: label,
        currentPeriod: currentRevenue,
        previousPeriod: previousRevenue,
      });
    }

    return data;
  }, [allOrders, selectedFilter, selectedLocal]);

  // Calcular variación de ingresos
  const revenueVariation = useMemo(() => {
    if (metrics.previousTotalRevenue > 0) {
      return (
        ((metrics.totalRevenue - metrics.previousTotalRevenue) /
          metrics.previousTotalRevenue) *
        100
      );
    }
    return metrics.totalRevenue > 0 ? 100 : 0;
  }, [metrics]);

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center px-4 md:px-6 lg:ml-72 lg:px-10">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#b36921]" />
          <p className="mt-4 text-[#4b2f1e]">Cargando analíticas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-10 text-black px-4 md:px-6 lg:ml-72 lg:px-10">
      {/* Header */}
      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 pb-8">
        <h1 className="text-2xl md:text-3xl font-semibold">Analítica - General</h1>
        <div className="w-full sm:w-auto">
          <select
            value={selectedLocal}
            onChange={(e) => setSelectedLocal(e.target.value)}
            className="w-full rounded-lg bg-[#EEAA4B] px-4 py-2 text-lg md:text-xl font-medium hover:bg-[#d99a3b] transition-colors cursor-pointer outline-none border-none"
          >
            <option value="all" >Vista general</option>
            {availableLocals.map((local, index) => (
              <option key={`local-${index}-${local}`} value={local}>
                {local.charAt(0).toUpperCase() + local.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Sección principal: Filtros + Métricas + Gráfico */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Filtros y Métricas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filtros */}
          <div className="rounded-xl bg-[#EEAA4B] p-5 shadow-md">
            <p className="text-lg font-semibold mb-4">Filtros</p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center justify-between">
                <label htmlFor="week" className="cursor-pointer">
                  Semana
                </label>
                <input
                  id="week"
                  name="filter"
                  type="radio"
                  checked={selectedFilter === "week"}
                  onChange={() => setSelectedFilter("week")}
                  className="cursor-pointer w-4 h-4"
                />
              </li>
              <li className="flex items-center justify-between">
                <label htmlFor="month" className="cursor-pointer">
                  Mes
                </label>
                <input
                  id="month"
                  name="filter"
                  type="radio"
                  checked={selectedFilter === "month"}
                  onChange={() => setSelectedFilter("month")}
                  className="cursor-pointer w-4 h-4"
                />
              </li>
              <li className="flex items-center justify-between">
                <label htmlFor="year" className="cursor-pointer">
                  Año
                </label>
                <input
                  id="year"
                  name="filter"
                  type="radio"
                  checked={selectedFilter === "year"}
                  onChange={() => setSelectedFilter("year")}
                  className="cursor-pointer w-4 h-4"
                />
              </li>
            </ul>
          </div>

          {/* Ventas Totales */}
          <div className="rounded-xl bg-[#4b2f1e] text-white p-5 shadow-md">
            <p className="text-sm opacity-80 mb-2">Ventas totales</p>
            <p className="text-4xl font-bold mb-2">{metrics.totalSales}</p>
            <p
              className={`text-sm font-semibold ${
                metrics.growth >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {metrics.growth >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(metrics.growth).toFixed(2)}%
            </p>
            <small className="text-xs opacity-70">
              Desde {selectedFilter === "week" ? "la semana" : selectedFilter === "month" ? "el mes" : "el año"} pasado
            </small>
          </div>

          {/* Crecimiento */}
          <div className="rounded-xl bg-[#4b2f1e] text-white p-5 shadow-md">
            <p className="text-sm opacity-80 mb-2">Crecimiento</p>
            <p className="text-4xl font-bold mb-2">
              {metrics.growth >= 0 ? "+" : ""}
              {metrics.growth.toFixed(2)}%
            </p>
            <p
              className={`text-sm font-semibold ${
                metrics.growth >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {metrics.growth >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(metrics.growth).toFixed(2)}%
            </p>
            <small className="text-xs opacity-70">
              Desde {selectedFilter === "week" ? "la semana" : selectedFilter === "month" ? "el mes" : "el año"} pasado
            </small>
          </div>

          {/* Ingresos Totales */}
          <div className="rounded-xl bg-[#4b2f1e] text-white p-5 shadow-md">
            <p className="text-sm opacity-80 mb-2">Ingresos totales</p>
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <p
              className={`text-sm font-semibold ${
                revenueVariation >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {revenueVariation >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(revenueVariation).toFixed(2)}%
            </p>
            <small className="text-xs opacity-70">
              Desde {selectedFilter === "week" ? "la semana" : selectedFilter === "month" ? "el mes" : "el año"} pasado
            </small>
          </div>
        </div>

        {/* Columna derecha: Gráfico */}
        <div className="lg:col-span-2 rounded-xl bg-[#4b2f1e] p-4 md:p-6 shadow-md">
          <p className="text-white text-xl md:text-2xl font-semibold mb-4">
            Ingresos totales
          </p>
          <ResponsiveContainer width="100%" height={600} className="md:h-[500px]">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EEAA4B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EEAA4B" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#666" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#2d2d2d",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => {
                  if (typeof value === "number") {
                    return formatCurrency(value);
                  }
                  return "N/A";
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="currentPeriod"
                stroke="#EEAA4B"
                fillOpacity={1}
                fill="url(#colorCurrent)"
                name={selectedFilter === "week" ? "Esta semana" : selectedFilter === "month" ? "Este mes" : "Este año"}
              />
              <Area
                type="monotone"
                dataKey="previousPeriod"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorPrevious)"
                name={selectedFilter === "week" ? "Semana pasada" : selectedFilter === "month" ? "Mes pasado" : "Año pasado"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tabla de Ventas de Productos */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-5">Venta de productos</h2>
        <div className="overflow-x-auto rounded-xl shadow-md">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-[#3f2e1f] text-white">
              <tr>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    <span>Nombre</span>
                    <span className="text-xs">{getSortIcon("name")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-2">
                    <span>Precio</span>
                    <span className="text-xs">{getSortIcon("price")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center gap-2">
                    <span>Cant. vendida</span>
                    <span className="text-xs">{getSortIcon("quantity")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("revenue")}
                >
                  <div className="flex items-center gap-2">
                    <span>Ingresos</span>
                    <span className="text-xs">{getSortIcon("revenue")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("percentage")}
                >
                  <div className="flex items-center gap-2">
                    <span>% total de ventas</span>
                    <span className="text-xs">{getSortIcon("percentage")}</span>
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#4f3e2f] transition-colors"
                  onClick={() => handleSort("variation")}
                >
                  <div className="flex items-center gap-2">
                    <span>var. periodo anterior</span>
                    <span className="text-xs">{getSortIcon("variation")}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#f5e6c8] text-sm text-black">
              {productStats.length > 0 ? (
                productStats.map((product, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#d9cbb3] transition-colors hover:bg-[#f3dbc0]"
                  >
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">{product.quantity}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="px-4 py-3">
                      {product.percentageOfTotal.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          product.variationPercentage >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.variationPercentage >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(product.variationPercentage).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay datos de productos para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
