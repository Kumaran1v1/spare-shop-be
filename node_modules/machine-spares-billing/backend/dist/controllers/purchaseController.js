"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseController = void 0;
const purchaseService_1 = require("../services/purchaseService");
const response_1 = require("../utils/response");
class PurchaseController {
    static async getAll(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const search = req.query.search;
            const status = req.query.status;
            const result = await purchaseService_1.PurchaseService.getAll({ search, status, page, limit }, req.user._id);
            (0, response_1.sendSuccess)(res, 'Purchases retrieved successfully', result.items, 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const purchase = await purchaseService_1.PurchaseService.getById(req.params.id, req.user._id);
            (0, response_1.sendSuccess)(res, 'Purchase record details retrieved', purchase);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const purchase = await purchaseService_1.PurchaseService.create(req.body, req.user._id);
            (0, response_1.sendSuccess)(res, 'Purchase recorded and stock updated successfully', purchase, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async payPending(req, res, next) {
        try {
            const { amount, paymentMethod, referenceNumber, notes } = req.body;
            const result = await purchaseService_1.PurchaseService.payPending(req.params.id, amount, paymentMethod, referenceNumber, notes, req.user._id);
            (0, response_1.sendSuccess)(res, 'Supplier payment recorded successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PurchaseController = PurchaseController;
