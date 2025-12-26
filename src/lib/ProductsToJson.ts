export interface Product {
  selected_options: string[];
  selectedOptions?: string[];
  quantity: number;
  name: string;
  price: number;
  size: string;
  sin: string[];
  fries: string;
}

export function parseLineItems(rawArray: string[]): Product[] {
  if (!Array.isArray(rawArray)) {
    console.error("❌ Esperaba un array y llegó:", rawArray);
    return [];
  }

  return rawArray
    .map((item, index): Product | null => {
      if (typeof item !== "string") {
        console.warn(`⏭️ Salteo índice ${index} (no es string):`, item);
        return null;
      }

      const trimmed = item.trim();

      // Solo intento parsear si parece JSON
      const looksLikeJson =
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"));

      if (!looksLikeJson) {
        console.warn(`⏭️ Salteo índice ${index} (no parece JSON):`, trimmed);
        return null;
      }

      try {
        const parsed = JSON.parse(trimmed) as Product;
        return parsed;
      } catch (e) {
        const error = e as Error;
        console.error(`❌ Error parseando índice ${index}:`, trimmed, error.message);
        return null;
      }
    })
    .filter((item): item is Product => item !== null); // saca los null con type guard
}
