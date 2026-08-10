"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const response_1 = require("../utils/response");
class PaymentController {
    static async getPendingPayments(req, res, next) {
        try {
            const search = req.query.search;
            const data = await paymentService_1.PaymentService.getPendingPayments({ search }, req.user._id);
            (0, response_1.sendSuccess)(res, 'Pending payments retrieved successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
