const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import app and required models
const app = require('../../app');
const User = require('../../models/User');
const Category = require('../../models/Category');

jest.setTimeout(600000);

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Test123456';

let mongod;

// DATABASE SETUP

beforeAll(async () => {
  // Disconnect any existing Mongoose connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongod = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
    instance: {
      instanceStartupTimeoutMs: 600000,
    },
  });

  const uri = mongod.getUri();
  process.env.MONGO_URI_TEST = uri;

  // Connect to the in-memory database
  await mongoose.connect(uri);
}, 600000);

// DATABASE CLEANUP

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongod) {
    await mongod.stop({ doCleanup: true });
  }
});

afterEach(async () => {
  // Clear all collections between test runs
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;

    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

// HELPER FUNCTIONS

async function createAdminAndLogin() {
  await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

  // Promote registered user to admin
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { role: 'admin' }
  );

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

  return loginRes.body.data.token;
}

async function createEvent(token, categoryId, eventData = {}) {
  const defaultEvent = {
    name: 'Node.js Conference',
    description: 'A conference about Node.js',
    date: '2026-09-01T10:00:00.000Z',
    venue: 'Main Hall',
    city: 'Cairo',
    capacity: 100,
    category: categoryId,
  };

  return request(app)
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send({
      ...defaultEvent,
      ...eventData,
    });
}

// EVENTS API TESTS

describe('Events API', () => {
  let token;
  let categoryId;

  beforeEach(async () => {
    token = await createAdminAndLogin();

    const category = await Category.create({
      name: 'Technology',
      description: 'Technology events',
    });

    categoryId = category._id.toString();
  });

  // POST /api/events
  
  test('POST /api/events creates an event (admin only)', async () => {
    const res = await createEvent(token, categoryId, {
      name: 'Node.js Conference',
      description: 'A conference about Node.js',
      date: '2026-09-01T10:00:00.000Z',
      venue: 'Main Hall',
      city: 'Cairo',
      capacity: 100,
    });

    expect(res.statusCode).toBe(201);

    // Controller returns status: "success"
    expect(res.body.status).toBe('success');

    expect(res.body.data.name).toBe('Node.js Conference');
    expect(res.body.data.description).toBe(
      'A conference about Node.js'
    );
    expect(res.body.data.city).toBe('Cairo');
    expect(res.body.data.venue).toBe('Main Hall');
    expect(res.body.data.capacity).toBe(100);
    expect(res.body.data.category._id).toBe(categoryId);
  });

  test('POST /api/events rejects non-admin users with 403', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'Password1',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@test.com',
        password: 'Password1',
      });

    const regularToken = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        name: 'Unauthorized Event',
        description: 'Should fail',
        date: '2026-09-01T10:00:00.000Z',
        venue: 'Main Hall',
        city: 'Cairo',
        capacity: 50,
        category: categoryId,
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/events without JWT token returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        name: 'Unauthenticated Event',
        description: 'Should fail',
        date: '2026-09-01T10:00:00.000Z',
        venue: 'Main Hall',
        city: 'Cairo',
        capacity: 100,
        category: categoryId,
      });

    expect(res.statusCode).toBe(401);
  });

  // VALIDATION - 422

  test('POST /api/events with missing required fields returns 422 Unprocessable Entity', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Missing required fields',
      });

    expect(res.statusCode).toBe(422);

    expect(res.body.status).not.toBe('success');
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('POST /api/events with invalid category returns 422', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Category Event',
        description: 'Testing invalid category',
        date: '2026-09-01T10:00:00.000Z',
        venue: 'Main Hall',
        city: 'Cairo',
        capacity: 100,
        category: 'invalid-category-id',
      });

    expect(res.statusCode).toBe(422);
  });

  test('POST /api/events with invalid date returns 422', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Date Event',
        description: 'Testing invalid date',
        date: 'not-a-date',
        venue: 'Main Hall',
        city: 'Cairo',
        capacity: 100,
        category: categoryId,
      });

    expect(res.statusCode).toBe(422);
  });

  test('POST /api/events with invalid capacity returns 422', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Capacity Event',
        description: 'Testing invalid capacity',
        date: '2026-09-01T10:00:00.000Z',
        venue: 'Main Hall',
        city: 'Cairo',
        capacity: 0,
        category: categoryId,
      });

    expect(res.statusCode).toBe(422);
  });

  // GET /api/events

  test('GET /api/events lists all events', async () => {
    await createEvent(token, categoryId, {
      name: 'Event A',
      description: 'Description A',
    });

    const res = await request(app).get('/api/events');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.data.length).toBe(1);
  });

  test('GET /api/events with city filter returns matching events', async () => {
    await createEvent(token, categoryId, {
      name: 'Cairo Event',
      description: 'In Cairo',
      city: 'Cairo',
    });

    await createEvent(token, categoryId, {
      name: 'Alexandria Event',
      description: 'In Alexandria',
      city: 'Alexandria',
    });

    const res = await request(app)
      .get('/api/events')
      .query({
        city: 'Cairo',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Cairo Event');
    expect(res.body.data[0].city).toBe('Cairo');
  });

  test('GET /api/events with search filter returns matching events', async () => {
    await createEvent(token, categoryId, {
      name: 'React Summit',
      description: 'Frontend engineering conference',
      city: 'Cairo',
    });

    await createEvent(token, categoryId, {
      name: 'Node Workshop',
      description: 'Backend development workshop',
      city: 'Cairo',
    });

    const res = await request(app)
      .get('/api/events')
      .query({
        search: 'React',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('React Summit');
  });

  test('GET /api/events with search and city filters', async () => {
    await createEvent(token, categoryId, {
      name: 'React Cairo',
      description: 'Frontend conference',
      city: 'Cairo',
    });

    await createEvent(token, categoryId, {
      name: 'React Alexandria',
      description: 'Frontend conference',
      city: 'Alexandria',
    });

    await createEvent(token, categoryId, {
      name: 'Node Cairo',
      description: 'Backend conference',
      city: 'Cairo',
    });

    const res = await request(app)
      .get('/api/events')
      .query({
        search: 'React',
        city: 'Cairo',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('React Cairo');
  });

  test('GET /api/events with no filters returns all events', async () => {
    await createEvent(token, categoryId, {
      name: 'Event 1',
      description: 'Desc 1',
      city: 'Cairo',
    });

    await createEvent(token, categoryId, {
      name: 'Event 2',
      description: 'Desc 2',
      city: 'Giza',
    });

    const res = await request(app).get('/api/events');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(2);
    expect(res.body.data.length).toBe(2);
  });

  test('GET /api/events with search that matches nothing returns an empty list', async () => {
    const res = await request(app)
      .get('/api/events')
      .query({
        search: 'nonexistentxyz',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  // PAGINATION

  test('GET /api/events supports pagination with page and limit', async () => {
    for (let i = 1; i <= 7; i++) {
      await createEvent(token, categoryId, {
        name: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const res = await request(app)
      .get('/api/events')
      .query({
        page: 1,
        limit: 5,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(7);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data.length).toBe(5);
  });

  test('GET /api/events returns second page correctly', async () => {
    for (let i = 1; i <= 7; i++) {
      await createEvent(token, categoryId, {
        name: `Event ${i}`,
        description: `Description ${i}`,
      });
    }

    const res = await request(app)
      .get('/api/events')
      .query({
        page: 2,
        limit: 5,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.total).toBe(7);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data.length).toBe(2);
  });

  // SORTING
 
  test('GET /api/events sorts by date ascending', async () => {
    await createEvent(token, categoryId, {
      name: 'Later Event',
      date: '2026-12-01T10:00:00.000Z',
    });

    await createEvent(token, categoryId, {
      name: 'Earlier Event',
      date: '2026-09-01T10:00:00.000Z',
    });

    const res = await request(app)
      .get('/api/events')
      .query({
        sortBy: 'date',
        order: 'asc',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data[0].name).toBe('Earlier Event');
    expect(res.body.data[1].name).toBe('Later Event');
  });

  test('GET /api/events sorts by date descending', async () => {
    await createEvent(token, categoryId, {
      name: 'Earlier Event',
      date: '2026-09-01T10:00:00.000Z',
    });

    await createEvent(token, categoryId, {
      name: 'Later Event',
      date: '2026-12-01T10:00:00.000Z',
    });

    const res = await request(app)
      .get('/api/events')
      .query({
        sortBy: 'date',
        order: 'desc',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data[0].name).toBe('Later Event');
    expect(res.body.data[1].name).toBe('Earlier Event');
  });

  // GET /api/events/:id

  test('GET /api/events/:id returns an event by id', async () => {
    const createRes = await createEvent(token, categoryId, {
      name: 'Single Event',
      description: 'Single event description',
    });

    const eventId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/events/${eventId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data._id).toBe(eventId);
    expect(res.body.data.name).toBe('Single Event');
  });

  test('GET /api/events/:id returns 404 for a missing event', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/events/${fakeId}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/events/:id handles invalid event id', async () => {
    const res = await request(app)
      .get('/api/events/not-a-valid-id');

    expect([400, 404, 422]).toContain(res.statusCode);
  });

  // PATCH /api/events/:id

  test('PATCH /api/events/:id updates an event (admin only)', async () => {
    const createRes = await createEvent(token, categoryId, {
      name: 'Original Event',
      description: 'Original description',
      city: 'Cairo',
    });

    const eventId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Event',
        description: 'Updated description',
        city: 'Giza',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Updated Event');
    expect(res.body.data.description).toBe('Updated description');
    expect(res.body.data.city).toBe('Giza');
  });

  test('PATCH /api/events/:id without JWT returns 401', async () => {
    const createRes = await createEvent(token, categoryId);

    const eventId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .send({
        name: 'Updated Event',
      });

    expect(res.statusCode).toBe(401);
  });

  test('PATCH /api/events/:id rejects non-admin users with 403', async () => {
    const createRes = await createEvent(token, categoryId);

    const eventId = createRes.body.data._id;

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'patchuser@test.com',
        password: 'Password1',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'patchuser@test.com',
        password: 'Password1',
      });

    const regularToken = loginRes.body.data.token;

    const res = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        name: 'Unauthorized Update',
      });

    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/events/:id with invalid id returns 422', async () => {
    const res = await request(app)
      .patch('/api/events/not-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Event',
      });

    expect(res.statusCode).toBe(422);
  });

  // DELETE /api/events/:id

  test('DELETE /api/events/:id deletes an event (admin only)', async () => {
    const createRes = await createEvent(token, categoryId, {
      name: 'Event To Delete',
    });

    const eventId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  test('DELETE /api/events/:id without JWT returns 401', async () => {
    const createRes = await createEvent(token, categoryId, {
      name: 'Event To Delete',
    });

    const eventId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/events/${eventId}`);

    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/events/:id rejects non-admin users with 403', async () => {
    const createRes = await createEvent(token, categoryId);

    const eventId = createRes.body.data._id;

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Delete User',
        email: 'deleteuser@test.com',
        password: 'Password1',
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'deleteuser@test.com',
        password: 'Password1',
      });

    const regularToken = loginRes.body.data.token;

    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${regularToken}`);

    expect(res.statusCode).toBe(403);
  });
});