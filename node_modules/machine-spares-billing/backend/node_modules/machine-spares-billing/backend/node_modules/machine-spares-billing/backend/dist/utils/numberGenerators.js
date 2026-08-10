"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePurchaseNumber = exports.generateBillNumber = void 0;
const Sale_1 = require("../models/Sale");
const Purchase_1 = require("../models/Purchase");
const generateBillNumber = async () => {
    const latestSale = await Sale_1.Sale.findOne({}, { billNumber: 1 })
        .sort({ createdAt: -1 })
        .lean();
    if (!latestSale || !latestSale.billNumber) {
        return 'SALE-000001';
    }
    const matches = latestSale.billNumber.match(/SALE-(\d+)/);
    if (matches && matches[1]) {
        const nextNum = parseInt(matches[1], 10) + 1;
        return `SALE-${nextNum.toString().padStart(6, '0')}`;
    }
    return `SALE-${Date.now()}`;
};
exports.generateBillNumber = generateBillNumber;
const generatePurchaseNumber = async () => {
    const latestPurchase = await Purchase_1.Purchase.findOne({}, { purchaseNumber: 1 })
        .sort({ createdAt: -1 })
        .lean();
    if (!latestPurchase || !latestPurchase.purchaseNumber) {
        return 'PUR-000001';
    }
    const matches = latestPurchase.purchaseNumber.match(/PUR-(\d+)/);
    if (matches && matches[1]) {
        const nextNum = parseInt(matches[1], 10) + 1;
        return `PUR-${nextNum.toString().padStart(6, '0')}`;
    }
    return `PUR-${Date.now()}`;
};
exports.generatePurchaseNumber = generatePurchaseNumber;
