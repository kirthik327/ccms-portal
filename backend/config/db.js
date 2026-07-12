const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Seed function for in-memory DB fallback
const seedInMemoryDatabase = async () => {
  try {
    const User = require('../models/User');
    const Complaint = require('../models/Complaint');

    // Create Super Admin
    await User.create({
      name: 'Principal',
      email: 'nit.principal.123',
      password: 'nit@principal#123',
      role: 'superadmin',
      department: 'Administration',
      employeeId: 'EMP-001',
    });

    // Create Regular Admin / Staff
    const staffAdmin = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'nit.incharge.123',
      password: 'nit@incharge#123',
      role: 'admin',
      department: 'Infrastructure',
      employeeId: 'EMP-002',
    });

    // Create Student
    const student = await User.create({
      name: 'Aditya Sen',
      email: 'student@college.edu',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS-2023-045',
      year: '3rd Year',
    });
    console.log('In-Memory Database Seeded successfully!');
  } catch (seedErr) {
    console.error('Error seeding in-memory database:', seedErr.message);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB connection already active. Reusing...');
    return;
  }
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ccms';
    
    try {
      console.log(`Connecting to MONGODB_URI: ${uri}...`);
      // Use 10000ms in production to allow cold starts, and 2000ms in development
      const timeout = process.env.NODE_ENV === 'production' ? 10000 : 2000;
      await mongoose.connect(uri, { serverSelectionTimeoutMS: timeout });

      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (connError) {
      console.log(`Connection failed: ${connError.message}`);
      
      if (process.env.NODE_ENV === 'production') {
        console.error('Database connection failed in production. Exiting process...');
        throw connError;
      }

      console.log('Spinning up MongoMemoryServer (In-Memory Database Fallback)...');
      
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      
      console.log(`MongoMemoryServer running at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('Connected to In-Memory MongoDB successfully.');

      // Automatically seed the in-memory instance
      await seedInMemoryDatabase();
    }
  } catch (error) {
    console.error(`Database connection / setup failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
