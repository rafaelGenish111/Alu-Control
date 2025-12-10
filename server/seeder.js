require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to DB for seeding...');

    // 2. Check if a Super Admin already exists
    const exists = await User.findOne({ role: 'super_admin' });
    if (exists) {
      console.log('⚠️ Super Admin already exists!');
      process.exit();
    }

    // 3. Create the initial Super Admin user
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'orr@glass.com', // initial login email
      password: 'orra_1234', // initial password (change it later)
      role: 'super_admin',
      language: 'es' // default language, useful to verify Spanish translations
    });

    console.log(`✅ Super Admin created successfully: ${superAdmin.email}`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedSuperAdmin();