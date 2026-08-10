import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { env } from '../config/env';

const seedAdmin = async () => {
  try {
    console.log('🌱 Connecting to MongoDB for seeding...');
    await mongoose.connect(env.MONGODB_URI);

    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user (${adminEmail}) already exists. Updating password/role...`);
      const hashedPassword = await hashPassword(env.ADMIN_PASSWORD);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'ADMIN';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log(`Creating initial admin user (${adminEmail})...`);
      const hashedPassword = await hashPassword(env.ADMIN_PASSWORD);
      await User.create({
        name: env.ADMIN_NAME,
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
Password: ${env.ADMIN_PASSWORD}
--------------------------------------------------
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
