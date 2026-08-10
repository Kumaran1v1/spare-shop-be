"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    console.error('🔥 Error Handler Caught:', err);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((el) => el.message);
        (0, response_1.sendError)(res, 'Validation Error', 422, errors);
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        (0, response_1.sendError)(res, `Duplicate field value entered for '${field}'. Please use another value.`, 409);
        return;
    }
    if (err.name === 'CastError') {
        (0, response_1.sendError)(res, `Invalid ID format: ${err.value}`, 400);
        return;
    }
    (0, response_1.sendError)(res, message, statusCode, env_1.env.NODE_ENV === 'development' ? [err.stack] : undefined);
};
exports.errorHandler = errorHandler;
