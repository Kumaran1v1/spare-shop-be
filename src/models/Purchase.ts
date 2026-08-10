import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  partNumber: string;
  spareName: string;
  image?: string;
  quantity: number;
  purchasePrice: number;
  amount: number;
}

export interface IPurchase extends Document {
  _id: mongoose.Types.ObjectId;
  purchaseNumber: string;
  supplierName: string;
  supplierMobile?: string;
  supplierInvoiceNumber?: string;
  purchaseDate: Date;
  items: IPurchaseItem[];
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

const purchaseItemSchema = new Schema<IPurchaseItem>(
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
    purchasePrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      index: true,
    },
    supplierMobile: { type: String, default: '', trim: true },
    supplierInvoiceNumber: { type: String, default: '', trim: true },
    purchaseDate: { type: Date, default: Date.now },
    items: {
      type: [purchaseItemSchema],
      validate: [(val: IPurchaseItem[]) => val.length > 0, 'Purchase must have at least one spare part'],
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

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);
