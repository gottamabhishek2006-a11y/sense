require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const cleanupDummyUsers = async () => {
  try {
    console.log('[Cleanup] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Cleanup] Connected.');

    // Delete pre-seeded dummy users
    const result = await User.deleteMany({
      email: {
        $in: [
          'citizen@civicfix.gov',
          'admin@civicfix.gov',
        ],
      },
    });

    // Also delete any test citizen accounts created during automated tests
    const testResult = await User.deleteMany({
      email: { $regex: /^testcitizen_/ },
    });

    console.log(`[Cleanup] Removed ${result.deletedCount + testResult.deletedCount} dummy / test users.`);
    console.log('[Cleanup] Database is now clean with real user records only.');
    process.exit(0);
  } catch (error) {
    console.error('[Cleanup Error]:', error);
    process.exit(1);
  }
};

cleanupDummyUsers();
