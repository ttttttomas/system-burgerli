import React from "react";
import {
  Printer,
  Text,
  Row,
  Br,
  Line,
  Cut,
} from "react-thermal-printer"; 

// Tipos de ejemplo, adaptalo a tu modelo real
export interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

export interface TicketOrder {
  id_order: string;
  products: string[];
  price: number;
  local: string;
}

export function buildReceipt(order: TicketOrder) {
    function parseBrokenJsonArray(arr: string[]) {
        // 1️⃣ Limpiar posibles llaves sobrantes al inicio o final de los fragmentos
        const cleaned = arr.map((str) =>
          str
            .replace(/^{/, "") // elimina { al inicio
            .replace(/}$/, "") // elimina } al final
            .trim()
        );
    
        // 2️⃣ Unir los fragmentos en una cadena JSON válida
        const jsonString = `{${cleaned.join(",")}}`;
    
        // 3️⃣ Intentar parsear el JSON a objeto
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.log(error);
          console.error("❌ Error al convertir a JSON:");
          console.error("Cadena generada:", jsonString);
          return null;
        }
      }

    const items = parseBrokenJsonArray(order.products);

  return (
    <Printer type="epson" width={42}>
      <Text align="center" size={{ width: 2, height: 2 }} bold>
        BURGERLI
      </Text>
      <Text align="center">{order.local}</Text>
      <Br />
      <Line />
      <Row left="ORDEN" right={`#${order.id_order}`} />
      <Row left="FECHA" right={new Date().toLocaleDateString()} />
      <Line />
      <Br />

      {items.map((item: any) => (
        <React.Fragment key={item.name}>
          <Row
            left={`${item.quantity}x ${item.name.slice(0, 24)}`}
            right={`$${item.price}`}
          />
        </React.Fragment>
      ))}

      <Br />
      <Line />
      <Row left="TOTAL" right={`$${order.price}`} />
      <Line />
      <Br />
      <Text align="center">¡Gracias por tu compra!</Text>
      <Br />
      <Cut />
    </Printer>
  );
}
