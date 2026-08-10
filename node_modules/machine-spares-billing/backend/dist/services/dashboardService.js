"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Sale_1 = require("../models/Sale");
const Purchase_1 = require("../models/Purchase");
const SalePayment_1 = require("../models/SalePayment");
const SparePart_1 = require("../models/SparePart");
class DashboardService {
    static async getSummary(userId) {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const [todaySalesAgg, todayPurchaseAgg, todayCollectionAgg, customerPendingAgg, supplierPendingAgg, totalSpareParts, lowStockSpares, recentSales,] = await Promise.all([
            // Today's Sales Sum for user
            Sale_1.Sale.aggregate([
                {
                    $match: {
                        createdBy: userObjectId,
                        createdAt: { $gte: startOfToday, $lte: endOfToday },
                    },
                },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ]),
            // Today's Purchases Sum for user
            Purchase_1.Purchase.aggregate([
                {
                    $match: {
                        createdBy: userObjectId,
                        createdAt: { $gte: startOfToday, $lte: endOfToday },
                    },
                },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ]),
            // Today's Collection Sum for user
            SalePayment_1.SalePayment.aggregate([
                {
                    $match: {
                        createdBy: userObjectId,
                        createdAt: { $gte: startOfToday, $lte: endOfToday },
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            // Total Customer Pending Balance for user
            Sale_1.Sale.aggregate([
                {
                    $match: {
                        createdBy: userObjectId,
                        pendingAmount: { $gt: 0 },
                    },
                },
                { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
            ]),
            // Total Supplier Pending Balance for user
            Purchase_1.Purchase.aggregate([
                {
                    $match: {
                        createdBy: userObjectId,
                        pendingAmount: { $gt: 0 },
                    },
                },
                { $group: { _id: null, total: { $sum: '$pendingAmount' } } },
            ]),
            // Total Count of Spare Parts for user
            SparePart_1.SparePart.countDocuments({ createdBy: userId, isActive: true }),
            // Low Stock Spares List for user (currentStock <= minimumStock)
            SparePart_1.SparePart.find({
                createdBy: userId,
                isActive: true,
                $expr: { $lte: ['$currentStock', '$minimumStock'] },
            })
                .select('partNumber name category brand machineType unit currentStock minimumStock image')
                .sort({ currentStock: 1 })
                .limit(10)
                .lean(),
            // Recent 5 Sales for user
            Sale_1.Sale.find({ createdBy: userId })
                .select('billNumber customerName grandTotal paidAmount pendingAmount paymentStatus createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);
        const todaySales = todaySalesAgg[0]?.total || 0;
        const todayPurchase = todayPurchaseAgg[0]?.total || 0;
        const todayCollection = todayCollectionAgg[0]?.total || 0;
        const customerPending = customerPendingAgg[0]?.total || 0;
        const supplierPending = supplierPendingAgg[0]?.total || 0;
        const lowStockCount = lowStockSpares.length;
        return {
            summary: {
                todaySales,
                todayPurchase,
                todayCollection,
                customerPending,
                supplierPending,
                totalSpareParts,
                lowStockCount,
            },
            recentSales,
            lowStockSpares,
        };
    }
}
exports.DashboardService = DashboardService;
