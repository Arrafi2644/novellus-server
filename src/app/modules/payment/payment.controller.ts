// import { Request, Response } from "express";
// import { PaymentService } from "./payment.service";
// import { catchAsync } from "../../utils/catchAsync";
// import { stripe } from "../../config/stripe";
// import { sendResponse } from "../../utils/sendResponse";


// const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {

//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = "whsec_7aa0e876564d7172ed1ebbda82f18cd6c740ac93ff44efecbf654c0d71bf3f1c"

//     let event;
//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err: any) {
//         console.error("⚠️ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     const result = await PaymentService.handleStripeWebhookEvent(event);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: 'Webhook req send successfully',
//         data: result,
//     });
// });

// export const PaymentController = {
//     handleStripeWebhookEvent
// }
// --------------------------------------------------------------


// import { Request, Response } from "express";
// import { stripe } from "../../config/stripe";
// import { PaymentService } from "./payment.service";
// import { catchAsync } from "../../utils/catchAsync";
// import { sendResponse } from "../../utils/sendResponse";

// // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// const handleStripeWebhookEvent = async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"] as string;
//   const webhookSecret = "whsec_08a5ad94e72e856212346906f7e9a422a5ba56c3e3bee443743b7267016ae77f";

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       webhookSecret
//     );
//   } catch (err: any) {
//     console.error("⚠️ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   await PaymentService.handleStripeWebhookEvent(event);

//   res.status(200).json({
//     success: true,
//     message: "Webhook handled successfully",
//   });
// };


// const getInvoiceDownloadUrl = catchAsync(
//   async (req: Request, res: Response) => {
//     const { paymentId } = req.params;

//     const result = await PaymentService.getInvoiceDownloadUrl(paymentId as string);

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Invoice download URL retrieved successfully",
//       data: result,
//     });
//   }
// );

// export const PaymentController = {
//   handleStripeWebhookEvent,
//   getInvoiceDownloadUrl
// };


import { Request, Response } from "express";
import { stripe } from "../../config/stripe";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET ||
  "whsec_08a5ad94e72e856212346906f7e9a422a5ba56c3e3bee443743b7267016ae77f";

/* =========================
   STRIPE WEBHOOK CONTROLLER
========================= */
const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // ⚠️ raw body
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await PaymentService.handleStripeWebhookEvent(event);

  res.status(200).json({
    success: true,
    message: "Webhook handled successfully",
  });
};

/* =========================
   INVOICE DOWNLOAD
========================= */
const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const result = await PaymentService.getInvoiceDownloadUrl(paymentId as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invoice download URL retrieved successfully",
      data: result,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
  getInvoiceDownloadUrl,
};

