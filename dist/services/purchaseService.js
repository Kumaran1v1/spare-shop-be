"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Purchase_1 = require("../models/Purchase");
const PurchasePayment_1 = require("../models/PurchasePayment");
const SparePart_1 = require("../models/SparePart");
const numberGenerators_1 = require("../utils/numberGenerators");
class PurchaseService {
    static async getAll(params, userId) {
        const { search, status, page = 1, limit = 10 } = params;
        const filter = { createdBy: userId };
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { purchaseNumber: regex },
                { supplierName: regex },
                { supplierInvoiceNumber: regex },
            ];
        }
        if (status && ['UNPAID', 'PARTIAL', 'PAID'].includes(status)) {
            filter.paymentStatus = status;
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Purchase_1.Purchase.find(filter)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Purchase_1.Purchase.countDocuments(filter),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getById(id, userId) {
        const purchase = await Purchase_1.Purchase.findOne({ _id: id, createdBy: userId })
            .populate('createdBy', 'name email')
            .lean();
        if (!purchase) {
            throw { statusCode: 404, message: 'Purchase record not found' };
        }
        const payments = await PurchasePayment_1.PurchasePayment.find({ purchaseId: id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        return {
            ...purchase,
            payments,
        };
    }
    static async create(data, userId) {
        const processedItems = [];
        let subtotal = 0;
        for (const item of data.items) {
            const spare = await SparePart_1.SparePart.findOne({ _id: item.productId, createdBy: userId });
            if (!spare) {
                throw { statusCode: 404, message: `Spare part not found with ID: ${item.productId}` };
            }
            const itemAmount = item.quantity * item.purchasePrice;
            subtotal += itemAmount;
            processedItems.push({
                productId: spare._id,
                partNumber: spare.partNumber,
                spareName: spare.name,
                image: spare.image || '',
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                amount: itemAmount,
            });
        }
        const grandTotal = Math.max(0, subtotal - data.discount + data.tax);
        const paidAmount = data.paidAmount || 0;
        if (paidAmount > grandTotal) {
            throw {
                statusCode: 400,
                message: `Paid amount (₹${paidAmount}) cannot exceed grand total (₹${grandTotal})`,
            };
        }
        const pendingAmount = grandTotal - paidAmount;
        let paymentStatus = 'UNPAID';
        if (paidAmount >= grandTotal && grandTotal > 0) {
            paymentStatus = 'PAID';
        }
        else if (paidAmount > 0) {
            paymentStatus = 'PARTIAL';
        }
        const purchaseNumber = await (0, numberGenerators_1.generatePurchaseNumber)();
        let session = null;
        try {
            session = await mongoose_1.default.startSession();
            session.startTransaction();
            const [newPurchase] = await Purchase_1.Purchase.create([
                {
                    purchaseNumber,
                    supplierName: data.supplierName,
                    supplierMobile: data.supplierMobile,
                    supplierInvoiceNumber: data.supplierInvoiceNumber,
                    purchaseDate: data.purchaseDate || new Date(),
                    items: processedItems,
                    subtotal,
                    discount: data.discount,
                    tax: data.tax,
                    grandTotal,
                    paidAmount,
                    pendingAmount,
                    paymentStatus,
                    notes: data.notes,
                    createdBy: userId,
                },
            ], { session });
            for (const item of processedItems) {
                await SparePart_1.SparePart.updateOne({ _id: item.productId, createdBy: userId }, { $inc: { currentStock: item.quantity } }, { session });
            }
            if (paidAmount > 0) {
                await PurchasePayment_1.PurchasePayment.create([
                    {
                        purchaseId: newPurchase._id,
                        amount: paidAmount,
                        paymentMethod: data.paymentMethod,
                        referenceNumber: data.referenceNumber,
                        paymentDate: newPurchase.purchaseDate,
                        notes: 'Initial purchase payment',
                        createdBy: userId,
                    },
                ], { session });
            }
            await session.commitTransaction();
            session.endSession();
            return await Purchase_1.Purchase.findById(newPurchase._id).populate('createdBy', 'name email');
        }
        catch (error) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
                session.endSession();
            }
            console.warn('⚠️ MongoDB Transaction failed or non-replica set. Executing fallback...');
            const newPurchase = await Purchase_1.Purchase.create({
                purchaseNumber,
                supplierName: data.supplierName,
                supplierMobile: data.supplierMobile,
                supplierInvoiceNumber: data.supplierInvoiceNumber,
                purchaseDate: data.purchaseDate || new Date(),
                items: processedItems,
                subtotal,
                discount: data.discount,
                tax: data.tax,
                grandTotal,
                paidAmount,
                pendingAmount,
                paymentStatus,
                notes: data.notes,
                createdBy: userId,
            });
            for (const item of processedItems) {
                await SparePart_1.SparePart.updateOne({ _id: item.productId, createdBy: userId }, { $inc: { currentStock: item.quantity } });
            }
            if (paidAmount > 0) {
                await PurchasePayment_1.PurchasePayment.create({
                    purchaseId: newPurchase._id,
                    amount: paidAmount,
                    paymentMethod: data.paymentMethod,
                    referenceNumber: data.referenceNumber,
                    paymentDate: newPurchase.purchaseDate,
                    notes: 'Initial purchase payment',
                    createdBy: userId,
                });
            }
            return await Purchase_1.Purchase.findById(newPurchase._id).populate('createdBy', 'name email');
        }
    }
    static async payPending(purchaseId, amount, paymentMethod, referenceNumber, notes, userId) {
        const purchase = await Purchase_1.Purchase.findOne({ _id: purchaseId, createdBy: userId });
        if (!purchase) {
            throw { statusCode: 404, message: 'Purchase record not found' };
        }
        if (purchase.pendingAmount <= 0) {
            throw { statusCode: 400, message: 'This purchase is already fully paid' };
        }
        if (amount > purchase.pendingAmount) {
            throw {
                statusCode: 400,
                message: `Payment amount (₹${amount}) cannot exceed pending amount (₹${purchase.pendingAmount})`,
            };
        }
        purchase.paidAmount += amount;
        purchase.pendingAmount = Math.max(0, purchase.grandTotal - purchase.paidAmount);
        if (purchase.pendingAmount === 0) {
            purchase.paymentStatus = 'PAID';
        }
        else {
            purchase.paymentStatus = 'PARTIAL';
        }
        await purchase.save();
        const paymentRecord = await PurchasePayment_1.PurchasePayment.create({
            purchaseId: purchase._id,
            amount,
            paymentMethod: paymentMethod || 'CASH',
            referenceNumber,
            notes,
            createdBy: userId,
        });
        return {
            purchase,
            paymentRecord,
        };
    }
}
exports.PurchaseService = PurchaseService;
