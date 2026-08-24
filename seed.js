require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Event = require('./models/Event');

// Default categories to be inserted into the database.
const CATEGORY_NAMES = [
  {
    name: 'Technology',
    description: 'Tech talks, hackathons, and workshops',
  },
  {
    name: 'Music',
    description: 'Concerts and live performances',
  },
  {
    name: 'Business',
    description: 'Networking and professional events',
  },
  {
    name: 'Sports',
    description: 'Sporting events and tournaments',
  },
];

/**
 * Creates the default administrator account using
 * credentials stored in environment variables.
 */
async function seedAdmin() {
  // Read admin credentials from environment variables.
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  // Ensure the required admin credentials are configured.
  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env'
    );
  }

  // Create the administrator user.
  const admin = await User.create({
    name: 'EventPulse Admin',
    email,
    password,
    role: 'admin',
  });

  console.log(`Created admin user: ${email}`);

  return admin;
}

/**
 * Connects to the database, clears existing seed data,
 * creates categories, an admin user, and sample events.
 */
async function run() {
  try {
    // Connect to MongoDB before starting the seed process.
    await connectDB();

    console.log('Connected to DB.');
    console.log('Clearing old data...');

    // Remove existing events, categories, and users.
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log('Old data cleared.');
    console.log('Seeding new data...');

    // Insert the default categories.
    const categories = await Category.insertMany(CATEGORY_NAMES);

    // Create the default administrator account.
    const admin = await seedAdmin();

    // Define sample events using the created category and admin IDs.
    const sampleEvents = [
      {
        name: 'React Summit 2026',
        description: 'A full day of talks on modern frontend engineering.',
        venue: 'Greek Campus',
        date: new Date('2026-09-15T09:00:00Z'),
        city: 'Cairo',
        capacity: 200,
        category: categories[0]._id,
        createdBy: admin._id,
      },
      {
        name: 'Indie Music Night',
        description: 'Local indie bands performing live.',
        venue: 'Alexandria Cultural Center',
        date: new Date('2026-08-20T19:00:00Z'),
        city: 'Alexandria',
        capacity: 150,
        category: categories[1]._id,
        createdBy: admin._id,
      },
      {
        name: 'Startup Networking Mixer',
        description: 'Meet founders, investors, and operators.',
        venue: 'Grind Innovation Hub',
        date: new Date('2026-10-01T18:00:00Z'),
        city: 'Cairo',
        capacity: 80,
        category: categories[2]._id,
        createdBy: admin._id,
      },
      {
        name: 'City Marathon',
        description: 'Annual 10k and 21k community run.',
        venue: 'Mansoura Stadium',
        date: new Date('2026-11-05T06:00:00Z'),
        city: 'Mansoura',
        capacity: 500,
        category: categories[3]._id,
        createdBy: admin._id,
      },
    ];

    // Insert the sample events into the database.
    const events = await Event.insertMany(sampleEvents);

    // Display the number of records created.
    console.log(`Categories created: ${categories.length}`);
    console.log(`Events created: ${events.length}`);
    console.log('Seeding completed successfully!');

    // Close the database connection after successful seeding.
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    // Log the error and close the database connection if seeding fails.
    console.error('Failed to seed database:', err);

    await mongoose.connection.close();
    process.exit(1);
  }
}

// Start the database seeding process.
run();