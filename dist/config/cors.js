"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const env_1 = require("./env");
exports.corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman, health checks)
        if (!origin)
            return callback(null, true);
        if (env_1.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        const allowedOrigins = [
            env_1.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:3000',
        ];
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
