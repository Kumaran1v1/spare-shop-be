"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSaleSchema = void 0;
const zod_1 = require("zod");
const saleItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
    sellingPrice: zod_1.z.number().min(0, 'Selling price cannot be negative'),
});
exports.createSaleSchema = zod_1.z.object({
    customerName: zod_1.z.string().min(1, 'Customer name is required').trim(),
    customerMobile: zod_1.z.string().optional().default(''),
    saleDate: zod_1.z.string().or(zod_1.z.date()).optional(),
    items: zod_1.z.array(saleItemSchema).min(1, 'At least one spare part item is required'),
    discount: zod_1.z.number().min(0, 'Discount cannot be negative').default(0),
    tax: zod_1.z.number().min(0, 'Tax cannot be negative').default(0),
    paidAmount: zod_1.z.number().min(0, 'Paid amount cannot be negative').default(0),
    paymentMethod: zod_1.z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
    referenceNumber: zod_1.z.string().optional().default(''),
    notes: zod_1.z.string().optional().default(''),
});
