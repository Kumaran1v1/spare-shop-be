"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_2 = require("./config/cors");
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sparePartRoutes_1 = __importDefault(require("./routes/sparePartRoutes"));
const purchaseRoutes_1 = __importDefault(require("./routes/purchaseRoutes"));
const saleRoutes_1 = __importDefault(require("./routes/saleRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const notFoundMiddleware_1 = require("./middleware/notFoundMiddleware");
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// API Routes
app.use('/api', healthRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/spare-parts', sparePartRoutes_1.default);
app.use('/api/purchases', purchaseRoutes_1.default);
app.use('/api/sales', saleRoutes_1.default);
app.use('/api', paymentRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
// Error & Not Found Handlers
app.use(notFoundMiddleware_1.notFoundHandler);
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
