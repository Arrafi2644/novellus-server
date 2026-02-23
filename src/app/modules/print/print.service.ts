import { printer as ThermalPrinter, types } from "node-thermal-printer";
import { IInvoiceData } from "../../utils/generatePdf";


// Helper: Column Align
const formatLine = (left: string, right: string) => {
  const totalWidth = 32;
  const space = totalWidth - left.length - right.length;
  return left + " ".repeat(space > 0 ? space : 1) + right;
};

// Helper: Trim Long Text
const trimText = (text: string, max = 30) =>
  text.length > max ? text.substring(0, max) + "..." : text;

export const printThermalInvoice = async (data: IInvoiceData) => {

  console.log("=== Thermal Print Simulation ===");
  console.log("Order ID:", data.orderId);
  console.log("Customer:", data.customerName);
  console.log("Amount:", data.amount);
  // console.log("Foods:", data.foods.map(f => `${f.quantity} x ${f.name} = ${f.subtotal}`));
  console.log("=== End of Print ===");

  const printer = new ThermalPrinter({
    type: types.EPSON,
    interface: "tcp://192.168.1.50:9100", // printer IP
    options: { timeout: 5000 },
  });

  const isConnected = await printer.isPrinterConnected();
  if (!isConnected) throw new Error("Printer not connected");

  printer.alignCenter();
  printer.bold(true);
  printer.setTextDoubleHeight();
  printer.println("INVOICE");
  printer.setTextNormal();
  printer.bold(false);
  printer.drawLine();

  printer.alignLeft();
  printer.bold(true);
  printer.println("ORDER INFO");
  printer.bold(false);
  printer.println(`Order ID: ${data.orderId}`);
  printer.println(`Date: ${data.orderDate.toLocaleString()}`);
  printer.println(`Type: ${data.orderType}`);
  printer.println(`Status: ${data.orderStatus}`);
  printer.println(`Delivery: ${data.deliveryOption}`);
  printer.drawLine();

  printer.bold(true);
  printer.println("PAYMENT INFO");
  printer.bold(false);
  printer.println(`Method: ${data.paymentMethod}`);
  printer.println(`Pay Status: ${data.paymentStatus}`);
  printer.println(`Txn ID: ${data.transactionId}`);
  printer.println(formatLine("Amount:", `${data.currency} ${data.amount.toFixed(2)}`));
  printer.drawLine();

  printer.bold(true);
  printer.println("CUSTOMER INFO");
  printer.bold(false);
  printer.println(`Name: ${trimText(data.customerName)}`);
  printer.println(`Phone: ${data.customerPhone}`);
  printer.println(`Email: ${trimText(data.customerEmail)}`);
  printer.println(`Address: ${trimText(data.customerAddress)}`);
  printer.drawLine();

  printer.bold(true);
  printer.println("ITEMS");
  printer.bold(false);
  data.foods.forEach((item, index) => {
    printer.println(`${index + 1}. ${trimText(item.name)}`);
    printer.println(formatLine(`${item.quantity} x ${item.price.toFixed(2)}`, `${item.subtotal.toFixed(2)}`));
    if (item.ingredients?.length) {
      item.ingredients.forEach((ing) => {
        printer.println(`   + ${trimText(ing.name)} (${ing.price.toFixed(2)})`);
      });
    }
    printer.newLine();
  });

  printer.drawLine();
  printer.bold(true);
  printer.alignRight();
  printer.println(`${data.currency} ${data.amount.toFixed(2)}`);
  printer.bold(false);

  printer.newLine();
  printer.alignCenter();
  printer.println("Thank You For Your Order!");
  printer.cut();

  await printer.execute();
};
