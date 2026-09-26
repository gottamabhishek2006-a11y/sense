/**
 * CivicSense Admin Seed Script
 * 
 * Usage: npm run seed:admin
 * 
 * Creates exactly ONE admin account from environment variables.
 * Will not create duplicates. Safe to run multiple times.
 * Never logs or exposes the admin password.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Municipal Administrator';

    // Validate required environment variables
    if (!adminEmail || !adminPassword) {
      console.error('[Seed] ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error('[Seed] ERROR: MONGODB_URI must be set in .env');
      process.exit(1);
    }

    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Seed] Connected to MongoDB Atlas');

    const normalizedEmail = adminEmail.trim().toLowerCase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      if (existingAdmin.role === 'admin') {
        console.log('[Seed] Admin account already exists. No changes made.');
        console.log(`[Seed] Admin email: ${existingAdmin.email}`);
        console.log(`[Seed] Admin name: ${existingAdmin.name}`);
      } else {
        // Exists but not admin - this should not happen in normal operation
        console.error('[Seed] ERROR: A user with this email already exists with a non-admin role.');
        console.error('[Seed] Change ADMIN_EMAIL to a different email address.');
        process.exit(1);
      }
    } else {
      // Verify no other admin exists
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        console.error('[Seed] ERROR: An admin account already exists in the database.');
        console.error('[Seed] Only ONE admin is permitted. Remove or inspect existing admin accounts.');
        process.exit(1);
      }

      // Create the admin account
      const admin = await User.create({
        name: adminName.trim(),
        email: normalizedEmail,
        password: adminPassword, // bcrypt hashing handled by User.pre('save') hook
        role: 'admin',
      });

      console.log('[Seed] ✅ Admin account created successfully!');
      console.log(`[Seed] Admin email: ${admin.email}`);
      console.log(`[Seed] Admin name: ${admin.name}`);
      console.log(`[Seed] Admin ID: ${admin._id}`);
      console.log('[Seed] Password stored as bcrypt hash. Never logged in plain text.');
    }

    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] FATAL ERROR: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
