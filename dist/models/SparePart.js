"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePart = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sparePartSchema = new mongoose_1.Schema({
    partNumber: {
        type: String,
        required: [true, 'Part number is required'],
        trim: true,
        uppercase: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Spare part name is required'],
        trim: true,
        index: true,
    },
    image: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true,
    },
    brand: {
        type: String,
        default: '',
        trim: true,
    },
    machineType: {
        type: String,
        default: '',
        trim: true,
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        default: 'Nos',
        trim: true,
    },
    purchasePrice: {
        type: Number,
        required: [true, 'Purchase price is required'],
        min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Selling price cannot be negative'],
    },
    minimumStock: {
        type: Number,
        default: 0,
        min: [0, 'Minimum stock cannot be negative'],
    },
    currentStock: {
        type: Number,
        default: 0,
        min: [0, 'Current stock cannot be negative'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});
// Compound index for user-isolated part numbers and search
sparePartSchema.index({ createdBy: 1, partNumber: 1 });
sparePartSchema.index({
    partNumber: 'text',
    name: 'text',
    category: 'text',
    brand: 'text',
    machineType: 'text',
});
exports.SparePart = mongoose_1.default.model('SparePart', sparePartSchema);
