"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async login(input) {
        const { email, password } = input;
        const user = await User_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }
        if (!user.isActive) {
            throw { statusCode: 401, message: 'Account is deactivated. Contact admin.' };
        }
        const isMatch = await (0, password_1.comparePassword)(password, user.password);
        if (!isMatch) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const userObj = user.toObject();
        delete userObj.password;
        return {
            token,
            user: userObj,
        };
    }
    static async getCurrentUser(userId) {
        const user = await User_1.User.findById(userId).lean();
        if (!user) {
            throw { statusCode: 44, message: 'User not found' };
        }
        return user;
    }
}
exports.AuthService = AuthService;
