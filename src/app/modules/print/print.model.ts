import mongoose, { Schema, Document } from "mongoose";

export interface IPrintJob extends Document {
  orderId: string;
  status: "PENDING" | "PRINTED" | "FAILED";
  retryCount: number;
  lastError?: string;
}

const PrintJobSchema = new Schema<IPrintJob>(
  {
    orderId: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PRINTED", "FAILED"],
      default: "PENDING",
    },
    retryCount: { type: Number, default: 0 },
    lastError: String,
  },
  { timestamps: true }
);

export const PrintJob = mongoose.model<IPrintJob>("PrintJob", PrintJobSchema);
