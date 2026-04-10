"use client";

import { useState } from "react";
import { Orders, ProductsOrder } from "@/types";

function buildReceiptHTML(order: Orders): string {
  const rawItems = order.products;
  const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];

  const total = order.price;
  const comision = (total * 0.08) / 1.08;
  const subtotal = total - comision;

  const parseItem = (item: any): ProductsOrder =>
    typeof item === "string" ? JSON.parse(item) : item;

  const getSelectedOptions = (p: ProductsOrder): string[] =>
    p.selected_options || p.selectedOptions || [];

  const itemsHTML = itemsArray
    .map((item) => {
      const p = parseItem(item);
      const opts = getSelectedOptions(p);
      return `
        <div class="row">
          <span>${p.quantity}x ${(p.name || "").slice(0, 22)}</span>
          <span>$${p.price}</span>
        </div>
        ${p.size ? `<div class="sub">+ Tamaño: ${p.size}</div>` : ""}
        ${p.sin && p.sin.length ? `<div class="sub">+ Sin: ${p.sin.join(", ")}</div>` : ""}
        ${p.fries ? `<div class="sub">+ Papas: ${p.fries}</div>` : ""}
        ${opts.length ? `<div class="sub">+ Opciones: ${opts.join(", ")}</div>` : ""}
        ${(p as any).notes ? `<div class="sub">* ${(p as any).notes}</div>` : ""}
      `;
    })
    .join("");

  const couponHTML =
    order.coupon_amount
      ? `<div class="row"><span>Cupón: ${order.coupon || ""}</span><span>-$${order.coupon_amount.toFixed(2)}</span></div><div class="line"></div>`
      : "";

  const totalsHTML =
    order.payment_method === "Efectivo"
      ? `<div class="row bold"><span>Total</span><span>$${total.toFixed(2)}</span></div>`
      : `
          <div class="row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="row"><span>Servicio (8%)</span><span>$${comision.toFixed(2)}</span></div>
          <div class="line"></div>
          <div class="row bold"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
        `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @page {
      size: 58mm auto;
      margin: 4mm 3mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: monospace;
      font-size: 16px;
      width: 52mm;
      color: #000;
      line-height: 1.5;
    }
    .center { text-align: center; }
    .big { font-size: 22px; font-weight: bold; }
    .bold { font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .br { height: 10px; }
    .row { display: flex; justify-content: space-between; }
    .sub { font-size: 13px; padding-left: 10px; }
  </style>
</head>
<body>
  <div class="center big">BURGERLI</div>
  <div class="center">${order.local}</div>
  <div class="br"></div>
  <div class="line"></div>
  <div class="bold">CLIENTE:</div>
  <div>Nombre: ${order.name || "N/A"}</div>
  ${order.phone ? `<div>Tel: ${order.phone}</div>` : ""}
  ${order.email ? `<div>Email: ${order.email}</div>` : ""}
  ${order.address ? `<div>Dirección: ${order.address}</div>` : ""}
  ${order.payment_method ? `<div>Pago: ${order.payment_method === "Efectivo" ? "Efectivo" : "Mercado Pago"}</div>` : ""}
  <div class="line"></div>
  <div class="row"><span>ORDEN</span><span>#${order.dailySequenceNumber?.toString().padStart(3, "0") || "---"}</span></div>
  <div class="row"><span>FECHA</span><span>${new Date().toLocaleDateString()}</span></div>
  <div class="line"></div>
  <div class="br"></div>
  ${itemsHTML}
  <div class="br"></div>
  <div class="line"></div>
  ${couponHTML}
  ${totalsHTML}
  <div class="line"></div>
  <div class="br"></div>
  <div class="center">¡Gracias por tu compra!</div>
</body>
</html>`;
}

export default function TicketPrintButton({ order }: { order: Orders }) {
  const [loading, setLoading] = useState(false);

  const printTicket = () => {
    setLoading(true);
    const html = buildReceiptHTML(order);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank", "width=300,height=600");
    if (!win) {
      alert("El navegador bloqueó la ventana emergente. Permitila para imprimir.");
      URL.revokeObjectURL(url);
      setLoading(false);
      return;
    }
    win.addEventListener("load", () => {
      const heightPx = win.document.body.scrollHeight;
      const heightMm = Math.ceil(heightPx * 0.2646) + 6;
      const dynStyle = win.document.createElement("style");
      dynStyle.textContent = `@page { size: 58mm ${heightMm}mm !important; margin: 2mm; }`;
      win.document.head.appendChild(dynStyle);
      win.focus();
      win.print();
      setLoading(false);
      win.addEventListener("afterprint", () => {
        win.close();
        URL.revokeObjectURL(url);
      });
    });
  };

  return (
    <button
      type="button"
      onClick={printTicket}
      className="rounded-xl border-2 cursor-pointer border-dashed border-[#EEAA4B] py-2 font-bold text-black"
      disabled={loading}
    >
      {loading ? "Imprimiendo..." : "Imprimir ticket"}
    </button>
  );
}
