const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Task = require('../models/Task');

dotenv.config({ path: __dirname + '/../.env' });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management_db');
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await Task.deleteMany();

    console.log('Cleared existing data.');

    // Create default users
    const admin = await User.create({
      name: 'Alex Rivera',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
    });

    const manager = await User.create({
      name: 'Sarah Connor',
      email: 'manager@example.com',
      password: 'password123',
      role: 'Manager',
    });

    const dev1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'Employee',
    });

    const dev2 = await User.create({
      name: 'Emily Watson',
      email: 'emily@example.com',
      password: 'password123',
      role: 'Employee',
    });

    console.log('Seeded Users: Admin, Manager, Employees');

    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 5);

    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 3);

    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 7);

    const overdueDate = new Date(today);
    overdueDate.setDate(today.getDate() - 2);

    await Task.create([
      {
        projectName: 'Enterprise CRM Portal',
        taskName: 'Design JWT Authentication Middleware & Route Guards',
        assignedTo: dev1._id,
        assignedBy: admin._id,
        status: 'Completed',
        priority: 'High',
        issueDate: pastDate,
        dueDate: today,
        description: 'Implement secure JWT token verification with bearer header parsing and role-based route protection.',
      },
      {
        projectName: 'Enterprise CRM Portal',
        taskName: 'Build Analytics Dashboard UI & Quick Stats Cards',
        assignedTo: dev2._id,
        assignedBy: manager._id,
        status: 'On Going',
        priority: 'Critical',
        issueDate: today,
        dueDate: futureDate1,
        description: 'Construct top statistics cards, recent tasks table, and interactive status filter dropdowns.',
      },
      {
        projectName: 'Payment Gateway Integration',
        taskName: 'Stripe Webhook Listener & Error Handling',
        assignedTo: dev1._id,
        assignedBy: manager._id,
        status: 'Pending',
        priority: 'High',
        issueDate: today,
        dueDate: overdueDate,
        description: 'Set up Stripe checkout session webhook listener with idempotency key checks.',
      },
      {
        projectName: 'Mobile App API',
        taskName: 'Refactor Task Filtering & Pagination Queries',
        assignedTo: dev2._id,
        assignedBy: admin._id,
        status: 'On Going',
        priority: 'Medium',
        issueDate: pastDate,
        dueDate: futureDate2,
        description: 'Optimize MongoDB text search index and aggregate counts for fast pagination.',
      },
      {
        projectName: 'Internal Tools',
        taskName: 'User Profile & Password Update Settings',
        assignedTo: dev1._id,
        assignedBy: manager._id,
        status: 'Pending',
        priority: 'Low',
        issueDate: today,
        dueDate: futureDate2,
        description: 'Create responsive user settings tab with form validation and password modification.',
      },
    ]);

    console.log('Seeded Task Management records successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
