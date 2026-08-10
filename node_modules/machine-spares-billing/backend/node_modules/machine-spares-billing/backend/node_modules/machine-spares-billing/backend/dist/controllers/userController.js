"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const response_1 = require("../utils/response");
class UserController {
    static async getAll(req, res, next) {
        try {
            const users = await userService_1.UserService.getAllUsers(req.user._id);
            (0, response_1.sendSuccess)(res, 'Users list retrieved successfully', users);
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const user = await userService_1.UserService.createUser(req.body);
            (0, response_1.sendSuccess)(res, 'New user account created successfully', user, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const user = await userService_1.UserService.updateUser(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 'User updated successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleStatus(req, res, next) {
        try {
            const user = await userService_1.UserService.toggleUserStatus(req.params.id);
            (0, response_1.sendSuccess)(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
