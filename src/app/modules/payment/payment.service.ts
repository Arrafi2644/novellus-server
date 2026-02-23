
import Stripe from "stripe";
import AppError from "../../errorHelpers/appError";
import { Payment } from "./payment.model";
import { Order } from "../order/order.model";
import { PaymentStatus } from "./payment.interface";
import { OrderStatus } from "../order/order.interface";
import { generatePdf } from "../../utils/generatePdf";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";


/* =========================
   STRIPE WEBHOOK HANDLER
========================= */
const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const orderId = session.metadata?.orderId;

      if (!paymentId || !orderId) {
        throw new Error("paymentId or orderId missing in stripe metadata");
      }

      const isPaid = session.payment_status === "paid";

      console.log("is Paid in stripe web hook  ", isPaid)
      // 1️⃣ Update payment
      const payment = await Payment.findByIdAndUpdate(
        paymentId,
        {
          paymentStatus: isPaid
            ? PaymentStatus.PAID
            : PaymentStatus.FAILED,
          transactionId: session.payment_intent as string,
        },
        { new: true }
      );

      if (!payment) {
        throw new Error("Payment not found");
      }

      // 2️⃣ Update order
      await Order.findByIdAndUpdate(orderId, {
        status: isPaid ? OrderStatus.COMPLETED : OrderStatus.CANCELLED,
        payment: payment._id,
      });

      await PaymentService.getInvoiceDownloadUrl(payment._id.toString());

      return {
        paymentId,
        orderId,
        status: payment.paymentStatus,
      };
    }

    default:
      console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
      return null;
  }
};


const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId).populate({
    path: "order",
    populate: [
      { path: "user", select: "name email phone address" },
      { path: "foods.food", select: "name" },
    ],
  });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  // 🔁 Already generated
  if (payment.invoiceUrl) {
    return { downloadUrl: payment.invoiceUrl };
  }

  const order: any = payment.order;

  if (!order) {
    throw new AppError(404, "Order not found for this payment");
  }

  // 🧾 Generate PDF buffer
  const invoiceBuffer = await generatePdf({
    orderId: order._id.toString(),
    orderDate: order.createdAt,
    orderType: order.orderType,
    orderStatus: order.status,
    deliveryOption: order.deliveryOption,

    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.paymentStatus,
    transactionId: payment.transactionId as string,
    amount: payment.amount,
    currency: "EUR",

    customerName: order?.user?.name || "N/A",
    customerEmail: order?.user?.email || "N/A",
    customerPhone: order?.user?.phone || "N/A",
    customerAddress: order?.deliveryAddress || "N/A",

    foods: order.foods.map((f: any) => ({
      name: f.food.name,
      quantity: f.quantity,
      price: f.unitPrice,
      subtotal: f.lineTotal,
      ingredients: f.ingredients.map((ing: any) => ({
        name: ing.name,
        price: ing.price,
      })),
    })),
  });

  // ☁️ Upload to Cloudinary
  const cloudinaryResult = await uploadBufferToCloudinary(
    invoiceBuffer,
    "invoice"
  );

  if (!cloudinaryResult) {
    throw new AppError(500, "Error uploading invoice to cloud");
  }

  // ✅ Save cloud URL
  payment.invoiceUrl = cloudinaryResult.secure_url;
  await payment.save();

  return { downloadUrl: cloudinaryResult.secure_url };
};


export const PaymentService = {
  handleStripeWebhookEvent,
  getInvoiceDownloadUrl,
};
