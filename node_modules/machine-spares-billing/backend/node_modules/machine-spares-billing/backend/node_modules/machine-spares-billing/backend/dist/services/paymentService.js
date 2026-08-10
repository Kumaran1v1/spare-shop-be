"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const Sale_1 = require("../models/Sale");
const Purchase_1 = require("../models/Purchase");
class PaymentService {
    static async getPendingPayments(params, userId) {
        const { search } = params;
        const saleFilter = { createdBy: userId, pendingAmount: { $gt: 0 } };
        const purchaseFilter = { createdBy: userId, pendingAmount: { $gt: 0 } };
        if (search) {
            const regex = new RegExp(search, 'i');
            saleFilter.$or = [
                { billNumber: regex },
                { customerName: regex },
                { customerMobile: regex },
            ];
            purchaseFilter.$or = [
                { purchaseNumber: regex },
                { supplierName: regex },
                { supplierInvoiceNumber: regex },
            ];
        }
        const [customerPending, supplierPending] = await Promise.all([
            Sale_1.Sale.find(saleFilter)
                .select('billNumber customerName customerMobile saleDate grandTotal paidAmount pendingAmount paymentStatus')
                .sort({ createdAt: -1 })
                .lean(),
            Purchase_1.Purchase.find(purchaseFilter)
                .select('purchaseNumber supplierName supplierMobile purchaseDate grandTotal paidAmount pendingAmount paymentStatus')
                .sort({ createdAt: -1 })
                .lean(),
        ]);
        return {
            customerPending,
            supplierPending,
        };
    }
}
exports.PaymentService = PaymentService;
