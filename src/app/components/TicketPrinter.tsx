import { Orders } from "@/types";
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



export function buildReceipt(order: Orders) {

  let rawItems = order.products;
  const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
  const subtotal = order.price
  const total = order.price + 10000

  return (
    // Cambiamos el ancho a 32 para impresoras de 58mm
    <Printer type="epson" width={32}>
      <Text align="center" size={{ width: 2, height: 2 }} bold>
        BURGERLI
      </Text>
      <Text align="center">{order.local}</Text>
      <Br />
      
      {/* --- SECCIÓN DEL CLIENTE --- */}
      <Line />
      <Text bold>CLIENTE:</Text>
      <Text>Nombre: {order.name || "N/A"}</Text>
      {order.phone && <Text>Tel: {order.phone}</Text>}
      {order.email && <Text size={{ width: 1, height: 1 }}>Email: {order.email}</Text>}
      {order.address && <Text size={{ width: 1, height: 1 }}>Dirección: {order.address}</Text>}
      <Line />
      
      <Row left="ORDEN" right={`#${order.id_order?.slice(-6)}`} />
      <Row left="FECHA" right={new Date().toLocaleDateString()} />
      <Line />
      <Br />

      {/* --- LISTA DE PRODUCTOS --- */}
      {itemsArray.map((item: any, index: number) => {
        // Parseo de seguridad si el item viene como string
        const p = typeof item === "string" ? JSON.parse(item) : item;
        return (
          <React.Fragment key={index}>
            <Row
              left={`${p.quantity}x ${p.name?.slice(0, 18)}`}
              right={`$${p.price}`}
            />
            {/* Si tienes extras como 'fries' o 'size', puedes agregarlos aquí en pequeño */}
            {p.fries && <Text size={{ width: 1, height: 1 }}> + {p.fries}</Text>}
          </React.Fragment>
        );
      })}

      <Br />
      <Line />
      {/* Sección de desglose de precios */}
      <Row left="Subtotal" right={`$${subtotal.toFixed(2)}`} />
      <Row left="Servicio" right={"$1.000"} />
      
      <Line />
      <Row 
        left={<Text bold>TOTAL</Text>} 
        right={<Text bold>{`$${total}`}</Text>} 
      />
      <Line />
      
      <Br />
      <Text align="center">¡Gracias por tu compra!</Text>
      <Br />
      <Cut />
    </Printer>
  );
}