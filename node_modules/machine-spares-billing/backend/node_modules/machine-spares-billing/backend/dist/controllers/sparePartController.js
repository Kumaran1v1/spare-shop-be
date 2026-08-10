"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePartController = void 0;
const sparePartService_1 = require("../services/sparePartService");
const response_1 = require("../utils/response");
class SparePartController {
    static async getAll(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const search = req.query.search;
            const category = req.query.category;
            const brand = req.query.brand;
            const machineType = req.query.machineType;
            const status = req.query.status;
            const result = await sparePartService_1.SparePartService.getAll({ search, category, brand, machineType, status, page, limit }, req.user._id);
            (0, response_1.sendSuccess)(res, 'Spare parts retrieved successfully', result.items, 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const spare = await sparePartService_1.SparePartService.getById(req.params.id, req.user._id);
            (0, response_1.sendSuccess)(res, 'Spare part details retrieved', spare);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const spare = await sparePartService_1.SparePartService.create(req.body, req.user._id);
            (0, response_1.sendSuccess)(res, 'Spare part created successfully', spare, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const spare = await sparePartService_1.SparePartService.update(req.params.id, req.body, req.user._id);
            (0, response_1.sendSuccess)(res, 'Spare part updated successfully', spare);
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleStatus(req, res, next) {
        try {
            const spare = await sparePartService_1.SparePartService.toggleStatus(req.params.id, req.user._id);
            (0, response_1.sendSuccess)(res, `Spare part status changed to ${spare.isActive ? 'Active' : 'Inactive'}`, spare);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SparePartController = SparePartController;
