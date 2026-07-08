const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ccms';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Complaint.deleteMany();
    console.log('Cleared existing Users and Complaints.');

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Principal',
      email: 'nit.principal.123',
      password: 'nit@principal#123',
      role: 'superadmin',
      department: 'Administration',
      employeeId: 'EMP-001',
    });

    // 2. Create Regular Admin / Staff
    const staffAdmin = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'nit.incharge.123',
      password: 'nit@incharge#123',
      role: 'admin',
      department: 'Infrastructure',
      employeeId: 'EMP-002',
    });

    // 3. Create Student
    const student = await User.create({
      name: 'Aditya Sen',
      email: '721021104001',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science and Engineering',
      rollNumber: '721021104001',
      year: '3rd Year',
    });

    console.log('Users created successfully:');
    console.log('  - Super Admin: nit.principal.123 / nit@principal#123');
    console.log('  - Staff Admin: nit.incharge.123 / nit@incharge#123');
    console.log('  - Student:     721021104001 / Student@123');

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
