
import { Order } from "../modules/order/order.model";
import { PrintJob } from "../modules/print/print.model";
import { printThermalInvoice } from "../modules/print/print.service";
import { IInvoiceData } from "./generatePdf";

const MAX_RETRY = 5;

export const startPrintWorker = () => {
    setInterval(async () => {
        const jobs = await PrintJob.find({ status: "PENDING" });

        for (const job of jobs) {
            try {
                const order = await Order.findById(job.orderId)
                    .populate("user", "name email phone")
                    .populate("payment", "paymentMethod paymentStatus transactionId amount")
                    .populate({
                        path: "foods.food",
                        select: "name price image"
                    });
                if (!order) continue;
                const payment: any = order?.payment;

                const user = order.user as unknown as { name: string; email: string; phone: string } | null;

                const invoiceData: IInvoiceData = {
                    orderId: order._id.toString(),
                    orderDate: order.createdAt || new Date(),
                    orderType: order.orderType,
                    orderStatus: order.status,
                    deliveryOption: order.deliveryOption,

                    paymentMethod: payment?.paymentMethod || "N/A",
                    paymentStatus: payment?.paymentStatus || "N/A",
                    transactionId: payment?.transactionId || "N/A",
                    amount: payment?.amount || 0,
                    currency: "EUR",

                    customerName: user?.name || "N/A",
                    customerEmail: user?.email || "N/A",
                    customerPhone: user?.phone || "N/A",
                    customerAddress: order.deliveryAddress || "N/A",

                    foods: order.foods.map((f: any) => ({
                        name: f.food.name,
                        quantity: f.quantity,
                        price: f.unitPrice,
                        subtotal: f.lineTotal,
                        ingredients: f.ingredients?.map((ing: any) => ({
                            name: ing.name,
                            price: ing.price,
                        })),
                    })),
                };

                console.log("Foods , ", order.foods.map((f: any) => (f)),)

                console.log("print payload ", invoiceData)

                await printThermalInvoice(invoiceData); // Printer call

                job.status = "PRINTED";
                await job.save();
            } catch (error: any) {
                job.retryCount += 1;
                job.lastError = error.message;

                if (job.retryCount >= MAX_RETRY) {
                    job.status = "FAILED";
                }

                await job.save();
            }
        }
    }, 10000); // 10 second interval
};
