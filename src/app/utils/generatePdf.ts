/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/appError";

export interface IInvoiceData {
  // Order
  orderId: string;
  orderDate: Date;
  orderType: string;
  orderStatus: string;
  deliveryOption: string;

  // Payment
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  amount: number;
  currency: string;

  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;

  // Items
  foods: {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    ingredients?: { name: string; price: number }[];
  }[];
}

export const generatePdf = async (
  data: IInvoiceData & { foods: (IInvoiceData["foods"][0] & { ingredients?: { name: string; price: number }[] })[] }
): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers: Uint8Array[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // ======================
      // HEADER
      // ======================
      doc
        .font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#1F2937")
        .text("INVOICE", { align: "center" });
      doc.moveDown(1);

      // ======================
      // ORDER, PAYMENT, CUSTOMER INFO
      // ======================
      const sectionFont = "Helvetica-Bold";
      const normalFont = "Helvetica";

      // --- Order Info ---
      doc.font(sectionFont).fontSize(14).fillColor("#111").text("Order Information");
      doc.moveDown(0.2);
      doc.font(normalFont).fontSize(12)
        .text(`Order ID: ${data.orderId}`)
        .text(`Order Date: ${data.orderDate.toDateString()}`)
        .text(`Order Type: ${data.orderType}`)
        .text(`Order Status: ${data.orderStatus}`)
        .text(`Delivery Option: ${data.deliveryOption}`);
      doc.moveDown(0.5);

      // --- Payment Info ---
      doc.font(sectionFont).fontSize(14).text("Payment Information");
      doc.moveDown(0.2);
      doc.font(normalFont).fontSize(12)
        .text(`Payment Method: ${data.paymentMethod}`)
        .text(`Payment Status: ${data.paymentStatus}`)
        .text(`Transaction ID: ${data.transactionId}`)
        .text(`Total Amount: ${data.currency} ${data.amount.toFixed(2)}`);
      doc.moveDown(0.5);

      // --- Customer Info ---
      doc.font(sectionFont).fontSize(14).text("Customer Information");
      doc.moveDown(0.2);
      doc.font(normalFont).fontSize(12)
        .text(`Name: ${data.customerName}`)
        .text(`Email: ${data.customerEmail}`)
        .text(`Phone: ${data.customerPhone}`)
        .text(`Address: ${data.customerAddress}`);
      doc.moveDown(1);

      // ======================
      // ORDER ITEMS (TABLE STYLE)
      // ======================
      doc.font(sectionFont).fontSize(14).text("Order Items");
      doc.moveDown(0.3);

      // Table positions
      const tableX = 50;
      const qtyX = 280;
      const priceX = 340;
      const subtotalX = 430;

      const rowHeight = 20;

      // Table Header
      doc.font("Helvetica-Bold").fontSize(12)
        .fillColor("#000")
        .text("Item", tableX)
        .text("Qty", qtyX)
        .text("Price", priceX)
        .text("Subtotal", subtotalX);

      doc.moveDown(0.3);

      // Draw line under header
      const tableHeaderY = doc.y;
      doc.moveTo(tableX, tableHeaderY).lineTo(550, tableHeaderY).strokeColor("#AAAAAA").stroke();
      doc.moveDown(0.5);

      // Table Rows
      data.foods.forEach((item, index) => {
        const y = doc.y;
        doc.font(normalFont).fontSize(12).fillColor("#111")
          .text(`${index + 1}. ${item.name}`, tableX, y)
          .text(item.quantity.toString(), qtyX, y)
          .text(`${data.currency} ${item.price.toFixed(2)}`, priceX, y)
          .text(`${data.currency} ${item.subtotal.toFixed(2)}`, subtotalX, y);

        doc.moveDown(0.5);

        // Ingredients
        if (item.ingredients && item.ingredients.length > 0) {
          const ingredientsText = item.ingredients.map((ing) => ing.name).join(", ");
          doc.font("Helvetica-Oblique").fontSize(10).fillColor("#555")
            .text(`Ingredients: ${ingredientsText}`, tableX + 15);
          doc.moveDown(0.3);
        }
      });

      doc.moveDown(0.5);

      // ======================
      // GRAND TOTAL
      // ======================
      doc.font(sectionFont).fontSize(14).fillColor("#111")
        .text(`Grand Total: ${data.currency} ${data.amount.toFixed(2)}`, { align: "right" });

      doc.moveDown(2);
      doc.font("Helvetica").fontSize(12).fillColor("#333")
        .text("Thank you for your order!", { align: "center" });

      doc.end();
    });
  } catch (error: any) {
    throw new AppError(500, `Pdf creation error ${error.message}`);
  }
};
