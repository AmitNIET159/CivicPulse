"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI_CIVICPULSE || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('Missing MongoDB URI. Set MONGODB_URI_CIVICPULSE or MONGODB_URI.');
        }
        const conn = await mongoose_1.default.connect(uri, {
            dbName: process.env.MONGODB_DB_NAME,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
mongoose_1.default.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});
exports.default = connectDB;
//# sourceMappingURL=db.js.map