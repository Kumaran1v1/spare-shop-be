import mongoose, { Document, Schema } from 'mongoose';

export interface ISparePart extends Document {
  _id: mongoose.Types.ObjectId;
  partNumber: string;
  name: string;
  image?: string;
  category: string;
  brand?: string;
  machineType?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock: number;
  currentStock: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sparePartSchema = new Schema<ISparePart>(
  {
    partNumber: {
      type: String,
      required: [true, 'Part number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Spare part name is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },
    machineType: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'Nos',
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-isolated part numbers and search
sparePartSchema.index({ createdBy: 1, partNumber: 1 });
sparePartSchema.index({
  partNumber: 'text',
  name: 'text',
  category: 'text',
  brand: 'text',
  machineType: 'text',
});

export const SparePart = mongoose.model<ISparePart>('SparePart', sparePartSchema);
