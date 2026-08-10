"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
class UserService {
    static async getAllUsers(currentUserId) {
        const users = await User_1.User.find({}).sort({ createdAt: -1 }).lean();
        return users;
    }
    static async createUser(data) {
        const existing = await User_1.User.findOne({ email: data.email.toLowerCase() }).lean();
        if (existing) {
            throw { statusCode: 409, message: `User with email '${data.email}' already exists` };
        }
        const hashedPassword = await (0, password_1.hashPassword)(data.password);
        const newUser = await User_1.User.create({
            name: data.name,
            email: data.email.toLowerCase(),
            password: hashedPassword,
            role: data.role || 'USER',
            isActive: true,
        });
        const userObj = newUser.toObject();
        delete userObj.password;
        return userObj;
    }
    static async updateUser(id, data) {
        const user = await User_1.User.findById(id);
        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }
        if (data.email && data.email.toLowerCase() !== user.email) {
            const existing = await User_1.User.findOne({
                email: data.email.toLowerCase(),
                _id: { $ne: id },
            }).lean();
            if (existing) {
                throw { statusCode: 409, message: `Email '${data.email}' is already in use by another user` };
            }
            user.email = data.email.toLowerCase();
        }
        if (data.name)
            user.name = data.name;
        if (data.role)
            user.role = data.role;
        if (typeof data.isActive === 'boolean')
            user.isActive = data.isActive;
        if (data.password) {
            user.password = await (0, password_1.hashPassword)(data.password);
        }
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    }
    static async toggleUserStatus(id) {
        const user = await User_1.User.findById(id);
        if (!user) {
            throw { statusCode: 404, message: 'User not found' };
        }
        user.isActive = !user.isActive;
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
    }
}
exports.UserService = UserService;
