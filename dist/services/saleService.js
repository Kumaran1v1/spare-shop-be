"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Sale_1 = require("../models/Sale");
const SalePayment_1 = require("../models/SalePayment");
const SparePart_1 = require("../models/SparePart");
const numberGenerators_1 = require("../utils/numberGenerators");
class SaleService {
    static async getAll(params, userId) {
        const { search, status, page = 1, limit = 10 } = params;
        const filter = { createdBy: userId };
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { billNumber: regex },
                { customerName: regex },
                { customerMobile: regex },
            ];
        }
        if (status && ['UNPAID', 'PARTIAL', 'PAID'].includes(status)) {
            filter.paymentStatus = status;
        }
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            Sale_1.Sale.find(filter)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Sale_1.Sale.countDocuments(filter),
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
        const sale = await Sale_1.Sale.findOne({ _id: id, createdBy: userId })
            .populate('createdBy', 'name email')
            .lean();
        if (!sale) {
            throw { statusCode: 404, message: 'Bill / Sale record not found' };
        }
        const payments = await SalePayment_1.SalePayment.find({ saleId: id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .lean();
        return {
            ...sale,
            payments,
        };
    }
    static async create(data, userId) {
        const processedItems = [];
        let subtotal = 0;
        for (const item of data.items) {
            const spare = await SparePart_1.SparePart.findOne({ _id: item.productId, createdBy: userId });
            if (!spare || !spare.isActive) {
                throw { statusCode: 404, message: `Spare part not found or inactive with ID: ${item.productId}` };
            }
            if (spare.currentStock < item.quantity) {
                throw {
                    statusCode: 400,
                    message: `Insufficient stock for '${spare.name}' (${spare.partNumber}). Available stock: ${spare.currentStock}, Requested: ${item.quantity}`,
                };
            }
            const itemAmount = item.quantity * item.sellingPrice;
            const itemProfit = (item.sellingPrice - spare.purchasePrice) * item.quantity;
            subtotal += itemAmount;
            processedItems.push({
                productId: spare._id,
                partNumber: spare.partNumber,
                spareName: spare.name,
                image: spare.image || '',
                quantity: item.quantity,
                sellingPrice: item.sellingPrice,
                purchasePriceSnapshot: spare.purchasePrice,
                amount: itemAmount,
                profit: itemProfit,
            });
        }
        const grandTotal = Math.max(0, subtotal - data.discount + data.tax);
        const paidAmount = data.paidAmount || 0;
        if (paidAmount > grandTotal) {
            throw {
                statusCode: 400,
                message: `Paid amount (₹${paidAmount}) cannot exceed bill total (₹${grandTotal})`,
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
        const billNumber = await (0, numberGenerators_1.generateBillNumber)();
        let session = null;
        try {
            session = await mongoose_1.default.startSession();
            session.startTransaction();
            for (const item of processedItems) {
                const updateResult = await SparePart_1.SparePart.updateOne({ _id: item.productId, createdBy: userId, currentStock: { $gte: item.quantity } }, { $inc: { currentStock: -item.quantity } }, { session });
                if (updateResult.modifiedCount === 0) {
                    throw new Error(`Stock concurrency conflict or insufficient stock for ${item.spareName}`);
                }
            }
            const [newSale] = await Sale_1.Sale.create([
                {
                    billNumber,
                    customerName: data.customerName,
                    customerMobile: data.customerMobile,
                    saleDate: data.saleDate || new Date(),
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
            if (paidAmount > 0) {
                await SalePayment_1.SalePayment.create([
                    {
                        saleId: newSale._id,
                        amount: paidAmount,
                        paymentMethod: data.paymentMethod,
                        referenceNumber: data.referenceNumber,
                        paymentDate: newSale.saleDate,
                        notes: 'Initial bill payment',
                        createdBy: userId,
                    },
                ], { session });
            }
            await session.commitTransaction();
            session.endSession();
            return await Sale_1.Sale.findById(newSale._id).populate('createdBy', 'name email');
        }
        catch (error) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
                session.endSession();
            }
            console.warn('⚠️ MongoDB Transaction failed or non-replica set. Executing fallback...');
            for (const item of processedItems) {
                const updateResult = await SparePart_1.SparePart.updateOne({ _id: item.productId, createdBy: userId, currentStock: { $gte: item.quantity } }, { $inc: { currentStock: -item.quantity } });
                if (updateResult.modifiedCount === 0) {
                    throw {
                        statusCode: 400,
                        message: `Insufficient stock or concurrency conflict for '${item.spareName}'`,
                    };
                }
            }
            const newSale = await Sale_1.Sale.create({
                billNumber,
                customerName: data.customerName,
                customerMobile: data.customerMobile,
                saleDate: data.saleDate || new Date(),
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
            if (paidAmount > 0) {
                await SalePayment_1.SalePayment.create({
                    saleId: newSale._id,
                    amount: paidAmount,
                    paymentMethod: data.paymentMethod,
                    referenceNumber: data.referenceNumber,
                    paymentDate: newSale.saleDate,
                    notes: 'Initial bill payment',
                    createdBy: userId,
                });
            }
            return await Sale_1.Sale.findById(newSale._id).populate('createdBy', 'name email');
        }
    }
    static async receivePayment(saleId, amount, paymentMethod, referenceNumber, notes, userId) {
        const sale = await Sale_1.Sale.findOne({ _id: saleId, createdBy: userId });
        if (!sale) {
            throw { statusCode: 404, message: 'Bill / Sale record not found' };
        }
        if (sale.pendingAmount <= 0) {
            throw { statusCode: 400, message: 'This bill is already fully paid' };
        }
        if (amount > sale.pendingAmount) {
            throw {
                statusCode: 400,
                message: `Payment amount (₹${amount}) cannot exceed pending amount (₹${sale.pendingAmount})`,
            };
        }
        sale.paidAmount += amount;
        sale.pendingAmount = Math.max(0, sale.grandTotal - sale.paidAmount);
        if (sale.pendingAmount === 0) {
            sale.paymentStatus = 'PAID';
        }
        else {
            sale.paymentStatus = 'PARTIAL';
        }
        await sale.save();
        const paymentRecord = await SalePayment_1.SalePayment.create({
            saleId: sale._id,
            amount,
            paymentMethod: paymentMethod || 'CASH',
            referenceNumber,
            notes,
            createdBy: userId,
        });
        return {
            sale,
            paymentRecord,
        };
    }
}
exports.SaleService = SaleService;
