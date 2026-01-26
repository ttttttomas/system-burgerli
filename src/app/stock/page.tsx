'use client';
import React, { useEffect, useState } from 'react'
import { useSession } from '../context/SessionContext';
import useProducts from '../hooks/useProducts';
import { Switch } from './switch';
import { toast } from 'sonner';

type Product = {
  id: string; // Generic id for helper
  name: string;
  stock_by_local: Record<string, boolean>;
  originalData: any; // Keep original object just in case
};

type CategoryData = {
  burgers: Product[];
  fries: Product[];
  drinks: Product[];
  promos: Product[];
};

export default function StockPage() {
    const { session } = useSession();
    const { getBurgers, getFries, getDrinks, getPromos, toggleBurgerStock, toggleFriesStock, toggleDrinkStock, togglePromoStock, getLocalByName } = useProducts();
    const [data, setData] = useState<CategoryData>({ burgers: [], fries: [], drinks: [], promos: [] });
    const [loading, setLoading] = useState(true);
    const [localDbId, setLocalDbId] = useState<string | null>(null);
    
    // session.local is the NAME (e.g. "gerli") which maps to stock_by_local keys
    const localName = session?.local?.toLowerCase(); 

    useEffect(() => {
        const fetchData = async () => {
            if (!localName) return;

            setLoading(true);
            try {
                // Fetch the actual local ID from the DB
                const localData = await getLocalByName(localName);
                if (localData && localData.id) {
                    setLocalDbId(localData.id);
                }
                
                const [burgers, fries, drinks, promos] = await Promise.all([
                    getBurgers(),
                    getFries(),
                    getDrinks(),
                    getPromos()
                ]);

                // Helper to format data
                const format = (items: any[], idKey: string) => items?.map(item => ({
                    id: item[idKey],
                    name: item.name,
                    stock_by_local: item.stock_by_local,
                    originalData: item
                })) || [];

                setData({
                    burgers: format(burgers, 'id_burger'),
                    fries: format(fries, 'id_fries'),
                    drinks: format(drinks, 'id_drinks'),
                    promos: format(promos, 'id_promos')
                });

            } catch (error) {
                console.error("Error fetching stock data", error);
                toast.error("Error cargando productos");
            } finally {
                setLoading(false);
            }
        };

        if (localName) {
            fetchData();
        }
    }, [localName]);

    const getStockValue = (product: Product) => {
        if (!localName) return false;
        return product.stock_by_local[localName] === true;
    };

    const handleToggle = async (category: keyof CategoryData, productId: string, currentStock: boolean) => {
        if (!localName || !localDbId) {
            toast.error("Error: Identificador del local no encontrado");
            return;
        }

        const newStock = !currentStock;

        // Optimistic update using localName for the UI
        setData(prev => ({
            ...prev,
            [category]: prev[category].map(p => 
                p.id === productId 
                ? { ...p, stock_by_local: { ...p.stock_by_local, [localName]: newStock } }
                : p
            )
        }));

        try {
           // Use the DB GUID (localDbId) for the API call
           if (category === 'burgers') await toggleBurgerStock(productId, localDbId, newStock);
           if (category === 'fries') await toggleFriesStock(productId, localDbId, newStock);
           if (category === 'drinks') await toggleDrinkStock(productId, localDbId, newStock);
           if (category === 'promos') await togglePromoStock(productId, localDbId, newStock);
           toast.success("Stock actualizado");
        } catch (error) {
            console.error(error);
            toast.error("Error actualizando stock");
            // Revert on error
            setData(prev => ({
                ...prev,
                [category]: prev[category].map(p => 
                    p.id === productId 
                    ? { ...p, stock_by_local: { ...p.stock_by_local, [localName]: currentStock } }
                    : p
                )
            }));
        }
    };

    if (!localName) return <div className="p-8 text-center">Cargando sesión...</div>;
    if (loading) return <div className="p-8 text-center">Cargando productos...</div>;

    // Show warning if we have localName (session) but failed to get localDbId
    if (!localDbId && !loading) return <div className="p-8 text-center text-red-500">Error: No se pudo obtener el ID del local "{localName}".</div>;

    const renderCategory = (title: string, category: keyof CategoryData) => (
        <div className="w-full max-w-4xl mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">{title}</h2>
            <div className=" rounded-lg shadow border-zinc-200 dark:border-zinc-800 p-4">
                {data[category].length === 0 ? (
                    <p className="">No hay productos en esta categoría.</p>
                ) : (
                    <div className="grid gap-4">
                        {data[category].map(product => {
                            const isStock = getStockValue(product);
                            return (
                                <div key={product.id} className="flex items-center justify-between p-3  rounded-md">
                                    <span className="font-medium text-lg">{product.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                            {isStock ? 'Disponible' : 'Sin Stock'}
                                        </span>
                                        <Switch 
                                            checked={isStock}
                                            onCheckedChange={() => handleToggle(category, product.id, isStock)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

  return (
    <main className="flex min-h-screen text-black flex-col items-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:pl-80 ">
      <h1 className="text-3xl font-bold mb-6">Gestión de Stock - {localName.charAt(0).toUpperCase() + localName.slice(1)}</h1>
      {renderCategory('Hamburguesas', 'burgers')}
      {renderCategory('Papas', 'fries')}
      {renderCategory('Bebidas', 'drinks')}
      {renderCategory('Promociones', 'promos')}
    </main>
  )
}
