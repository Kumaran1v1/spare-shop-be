"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSparePartSchema = exports.createSparePartSchema = void 0;
const zod_1 = require("zod");
exports.createSparePartSchema = zod_1.z.object({
    partNumber: zod_1.z.string().min(1, 'Part number is required').trim(),
    name: zod_1.z.string().min(1, 'Spare part name is required').trim(),
    image: zod_1.z.string().optional().default(''),
    category: zod_1.z.string().min(1, 'Category is required').trim(),
    brand: zod_1.z.string().optional().default(''),
    machineType: zod_1.z.string().optional().default(''),
    unit: zod_1.z.string().min(1, 'Unit is required').trim().default('Nos'),
    purchasePrice: zod_1.z.number().min(0, 'Purchase price cannot be negative'),
    sellingPrice: zod_1.z.number().min(0, 'Selling price cannot be negative'),
    minimumStock: zod_1.z.number().min(0, 'Minimum stock cannot be negative').default(0),
});
exports.updateSparePartSchema = exports.createSparePartSchema.partial();
