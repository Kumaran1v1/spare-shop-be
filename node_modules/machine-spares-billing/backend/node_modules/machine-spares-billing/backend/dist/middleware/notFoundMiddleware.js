"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const response_1 = require("../utils/response");
const notFoundHandler = (req, res) => {
    (0, response_1.sendError)(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
exports.notFoundHandler = notFoundHandler;
