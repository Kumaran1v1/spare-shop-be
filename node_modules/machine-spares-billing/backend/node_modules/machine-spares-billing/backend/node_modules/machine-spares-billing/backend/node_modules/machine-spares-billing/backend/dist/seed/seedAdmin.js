"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const password_1 = require("../utils/password");
const env_1 = require("../config/env");
const seedAdmin = async () => {
    try {
        console.log('🌱 Connecting to MongoDB for seeding...');
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        const adminEmail = env_1.env.ADMIN_EMAIL.toLowerCase();
        const existingAdmin = await User_1.User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`ℹ️ Admin user (${adminEmail}) already exists. Updating password/role...`);
            const hashedPassword = await (0, password_1.hashPassword)(env_1.env.ADMIN_PASSWORD);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'ADMIN';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('✅ Admin user updated successfully.');
        }
        else {
            console.log(`Creating initial admin user (${adminEmail})...`);
            const hashedPassword = await (0, password_1.hashPassword)(env_1.env.ADMIN_PASSWORD);
            await User_1.User.create({
                name: env_1.env.ADMIN_NAME,
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                isActive: true,
            });
            console.log('✅ Admin user created successfully.');
        }
        console.log(`
--------------------------------------------------
🔑 Admin Login Credentials:
Email:    ${adminEmail}
Password: ${env_1.env.ADMIN_PASSWORD}
--------------------------------------------------
    `);
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding admin user:', error);
        process.exit(1);
    }
};
seedAdmin();
