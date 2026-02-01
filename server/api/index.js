// Vercel serverless function entry point
// This file is used when deploying to Vercel
// Note: dotenv is not needed in Vercel - environment variables are provided automatically
const mongoose = require('mongoose');
const app = require('../app');

// Connect to MongoDB (cached connection)
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    // Check if MONGO_URI is set
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        const error = new Error('MONGO_URI environment variable is not set');
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('mongo')));
        throw error;
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
            console.log('✅ MongoDB Connected (Vercel)');
        }
        isConnected = true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        isConnected = false;
        throw error;
    }
};

// Export handler for Vercel
module.exports = async (req, res) => {
    // Connect to DB if not connected
    try {
        await connectDB();
    } catch (error) {
        return res.status(500).json({ error: 'Database connection failed' });
    }

    // Handle the request
    return app(req, res);
};
