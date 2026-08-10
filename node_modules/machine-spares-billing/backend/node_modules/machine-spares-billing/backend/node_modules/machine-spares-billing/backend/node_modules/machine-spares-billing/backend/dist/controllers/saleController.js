"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleController = void 0;
const saleService_1 = require("../services/saleService");
const response_1 = require("../utils/response");
class SaleController {
    static async getAll(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const search = req.query.search;
            const status = req.query.status;
            const result = await saleService_1.SaleService.getAll({ search, status, page, limit }, req.user._id);
            (0, response_1.sendSuccess)(res, 'Bills / Sales retrieved successfully', result.items, 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const sale = await saleService_1.SaleService.getById(req.params.id, req.user._id);
            (0, response_1.sendSuccess)(res, 'Bill details retrieved', sale);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const sale = await saleService_1.SaleService.create(req.body, req.user._id);
            (0, response_1.sendSuccess)(res, 'Bill created and stock updated successfully', sale, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async receivePayment(req, res, next) {
        try {
            const { amount, paymentMethod, referenceNumber, notes } = req.body;
            const result = await saleService_1.SaleService.receivePayment(req.params.id, amount, paymentMethod, referenceNumber, notes, req.user._id);
            (0, response_1.sendSuccess)(res, 'Customer payment received successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SaleController = SaleController;
