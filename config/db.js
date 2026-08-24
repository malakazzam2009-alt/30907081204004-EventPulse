const mongoose = require('mongoose');

// Connect the application to MongoDB.
async function connectDB() {
  // Select the test database when running tests.
  const uri =
    process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TEST || process.env.MONGO_URI
      : process.env.MONGO_URI;

  // Check that the MongoDB connection string exists.
  if (!uri) {
    console.error(
      'FATAL: No MongoDB connection string found in environment variables.'
    );
    throw new Error('Missing MONGO_URI environment variable');
  }

  // Reuse an existing connection.
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Wait for an existing connection attempt.
  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return mongoose.connection;
  }

  // Log when MongoDB is connected.
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
  });

  // Log MongoDB connection errors.
  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err.message);
  });

  // Log when MongoDB is disconnected.
  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected');
  });

  // Connect to MongoDB.
  await mongoose.connect(uri);

  // Confirm that the database is connected.
  console.log('MongoDB Connected');

  return mongoose.connection;
}

// Get the current MongoDB connection state.
function getDBState() {
  const states = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, getDBState };