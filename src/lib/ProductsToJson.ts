export function parseLineItems(rawArray: string[]) {
  if (!Array.isArray(rawArray)) {
    console.error("❌ Esperaba un array y llegó:", rawArray);
    return [];
  }

  return rawArray
    .map((item, index) => {
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
        return JSON.parse(trimmed);
      } catch (e) {
        console.error(`❌ Error parseando índice ${index}:`, trimmed, e.message);
        return null;
      }
    })
    .filter(Boolean); // saca los null
}