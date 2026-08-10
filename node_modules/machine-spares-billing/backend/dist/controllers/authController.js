"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const response_1 = require("../utils/response");
class AuthController {
    static async login(req, res, next) {
        try {
            const result = await authService_1.AuthService.login(req.body);
            (0, response_1.sendSuccess)(res, 'Login successful', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const user = await authService_1.AuthService.getCurrentUser(req.user._id);
            (0, response_1.sendSuccess)(res, 'Current user retrieved', user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
