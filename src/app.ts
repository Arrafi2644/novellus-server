import express, { Request, Response } from "express"
import { router } from "./app/routes"
import { globalErrorHandler } from "./app/middleware/globalErrorHandler"
import notFound from "./app/middleware/notFound"
import cookieParser from "cookie-parser";
import cors from "cors"
import { PaymentController } from "./app/modules/payment/payment.controller";
import path from "path";
import { envVars } from "./app/config/env";
import { startPrintWorker } from "./app/utils/printWorker";

const app = express()

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);
app.use(cookieParser());
app.use(express.json())

app.use(cors({
    origin: [
        "http://localhost:3000",
        envVars.FRONTEND_URL,
    ],
    credentials: true
}))


app.use("/api/v1", router)

// Start worker after routes
startPrintWorker();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "FoodNest application is running!!!"
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app;