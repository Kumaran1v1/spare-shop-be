import mongoose, { Document, Schema } from 'mongoose';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface IPurchasePayment extends Document {
  _id: mongoose.Types.ObjectId;
  purchaseId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchasePaymentSchema = new Schema<IPurchasePayment>(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: 'Purchase',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'],
      default: 'CASH',
    },
    referenceNumber: { type: String, default: '', trim: true },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, default: '', trim: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PurchasePayment = mongoose.model<IPurchasePayment>('PurchasePayment', purchasePaymentSchema);
