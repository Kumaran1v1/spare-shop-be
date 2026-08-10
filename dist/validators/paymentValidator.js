"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentSchema = void 0;
const zod_1 = require("zod");
exports.recordPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().gt(0, 'Payment amount must be greater than 0'),
    paymentMethod: zod_1.z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
    referenceNumber: zod_1.z.string().optional().default(''),
    notes: zod_1.z.string().optional().default(''),
});
