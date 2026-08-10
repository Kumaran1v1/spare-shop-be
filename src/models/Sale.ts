import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  partNumber: string;
  spareName: string;
  image?: string;
  quantity: number;
  sellingPrice: number;
  purchasePriceSnapshot: number;
  amount: number;
  profit: number;
}

export interface ISale extends Document {
  _id: mongoose.Types.ObjectId;
  billNumber: string;
  customerName: string;
  customerMobile?: string;
  saleDate: Date;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'SparePart',
      required: true,
    },
    partNumber: { type: String, required: true },
    spareName: { type: String, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    purchasePriceSnapshot: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    customerMobile: { type: String, default: '', trim: true, index: true },
    saleDate: { type: Date, default: Date.now },
    items: {
      type: [saleItemSchema],
      validate: [(val: ISaleItem[]) => val.length > 0, 'Sale must have at least one spare part'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID',
    },
    notes: { type: String, default: '' },
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

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
