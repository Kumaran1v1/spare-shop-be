import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { User } from '../models/User';
import { SparePart } from '../models/SparePart';
import { Purchase } from '../models/Purchase';
import { PurchasePayment } from '../models/PurchasePayment';
import { Sale } from '../models/Sale';
import { SalePayment } from '../models/SalePayment';
import { hashPassword } from '../utils/password';

// Fallback to Google DNS to prevent Windows local network ESERVFAIL SRV lookup issues
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore error if custom DNS cannot be set
}

export const autoInitTablesAndAdmin = async (): Promise<void> => {
  try {
    // 1. Auto-create collections & build indexes for all models
    console.log('🛠️ Auto-initializing database tables and indexes...');
    
    await Promise.all([
      User.createCollection().catch(() => {}),
      SparePart.createCollection().catch(() => {}),
      Purchase.createCollection().catch(() => {}),
      PurchasePayment.createCollection().catch(() => {}),
      Sale.createCollection().catch(() => {}),
      SalePayment.createCollection().catch(() => {}),
    ]);

    await Promise.all([
      User.init().catch(() => {}),
      SparePart.init().catch(() => {}),
      Purchase.init().catch(() => {}),
      PurchasePayment.init().catch(() => {}),
      Sale.init().catch(() => {}),
      SalePayment.init().catch(() => {}),
    ]);

    // 2. Auto-insert default Admin user into users table if not exists
    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log(`👤 Creating default admin user (${adminEmail}) in 'users' table...`);
      const hashedPassword = await hashPassword(env.ADMIN_PASSWORD);
      await User.create({
        name: env.ADMIN_NAME,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      });
      console.log('✅ Default admin user automatically inserted.');
    } else {
      console.log(`ℹ️ Admin user (${adminEmail}) is ready.`);
    }

    console.log('✅ All tables (users, spareparts, purchases, purchasepayments, sales, salepayments) initialized.');
  } catch (error) {
    console.error('⚠️ Warning during table auto-initialization:', error);
  }
};

export const connectDB = async (): Promise<void> => {
  const primaryUri = env.MONGODB_URI;
  const localFallbackUri = 'mongodb://127.0.0.1:27017/machine_spares';
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔌 Connecting to MongoDB (Attempt ${attempt}/${maxRetries})...`);
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        family: 4,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
      
      // Automatically create collections & insert default Admin user on startup
      await autoInitTablesAndAdmin();
      return;
    } catch (error: any) {
      console.error(`❌ MongoDB Connection Error (Attempt ${attempt}/${maxRetries}):`, error?.message || error);

      if (attempt < maxRetries && primaryUri.includes('mongodb.net')) {
        console.log(`⏳ Retrying connection in 3 seconds...`);
        await new Promise((res) => setTimeout(res, 3000));
        continue;
      }

      if (primaryUri.includes('mongodb.net')) {
        console.warn('⚠️ Atlas Connection Issue Detected!');
        console.warn('👉 Action Required: Open MongoDB Atlas (https://cloud.mongodb.com) -> Security -> Network Access -> Add IP Address "0.0.0.0/0"');
      }

      // In development mode, automatically fallback to local MongoDB if primary Atlas connection fails
      if (env.NODE_ENV === 'development' && primaryUri !== localFallbackUri) {
        console.log(`🔄 Switching fallback to local MongoDB (${localFallbackUri})...`);
        try {
          const localConn = await mongoose.connect(localFallbackUri, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log(`✅ MongoDB Connected (Local Fallback): ${localConn.connection.host} / ${localConn.connection.name}`);
          await autoInitTablesAndAdmin();
          return;
        } catch (localErr: any) {
          console.error('❌ Local MongoDB fallback also failed:', localErr?.message || localErr);
        }
      }

      process.exit(1);
    }
  }
};
