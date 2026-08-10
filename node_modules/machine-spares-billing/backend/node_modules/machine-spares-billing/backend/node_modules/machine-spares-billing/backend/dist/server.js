"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const startServer = async () => {
    await (0, database_1.connectDB)();
    const PORT = parseInt(env_1.env.PORT, 10) || 5000;
    const server = app_1.default.listen(PORT, () => {
        console.log(`
🚀 Backend API Server running on port ${PORT} [${env_1.env.NODE_ENV}]
👉 Health Check: http://localhost:${PORT}/api/health
    `);
    });
    const handleShutdown = (signal) => {
        console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('🛑 Server closed.');
            process.exit(0);
        });
    };
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
};
startServer();
