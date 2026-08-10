"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const User_1 = require("../models/User");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.sendError)(res, 'Access denied. No authentication token provided.', 401);
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.User.findById(decoded.userId).lean();
        if (!user || !user.isActive) {
            (0, response_1.sendError)(res, 'User session is invalid or user account is inactive.', 401);
            return;
        }
        req.user = {
            ...decoded,
            _id: decoded.userId,
        };
        next();
    }
    catch (error) {
        (0, response_1.sendError)(res, 'Invalid or expired token.', 401);
    }
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            (0, response_1.sendError)(res, 'Forbidden: You do not have permission to access this resource.', 403);
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
