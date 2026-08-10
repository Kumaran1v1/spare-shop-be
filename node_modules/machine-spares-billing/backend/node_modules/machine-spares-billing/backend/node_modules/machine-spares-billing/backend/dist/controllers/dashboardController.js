"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboardService_1 = require("../services/dashboardService");
const response_1 = require("../utils/response");
class DashboardController {
    static async getSummary(req, res, next) {
        try {
            const data = await dashboardService_1.DashboardService.getSummary(req.user._id);
            (0, response_1.sendSuccess)(res, 'Dashboard analytics retrieved successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
