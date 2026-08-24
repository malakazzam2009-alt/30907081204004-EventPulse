EventPulse - Event Management Backend API
EventPulse is a backend project for managing events using Node.js, Express, MongoDB, and Socket.io.

The project includes:

User registration and login using JWT
Admin and attendee roles
Categories management
Events management
Event filtering, pagination, sorting, and search
Event registration
Event capacity checking
Real-time announcements using Socket.io
Error handling and validation
Automated tests
Swagger API documentation
Technologies
Node.js
Express.js
MongoDB
Mongoose
Socket.io
JWT
bcrypt
express-validator
Jest
Supertest
mongodb-memory-server
Swagger
Project Structure
EventPulse/
│
├── app.js
├── server.js
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Event.js
│   ├── Category.js
│   ├── Registration.js
│   └── Message.js
│
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   ├── categoryController.js
│   ├── registrationController.js
│   └── messageController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── categoryRoutes.js
│   ├── registrationRoutes.js
│   └── healthRoutes.js
│
├── middleware/
│   ├── requireAuth.js
│   ├── requireRole.js
│   ├── errorMiddleware.js
│   └── validators.js
│
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   └── generateToken.js
│
├── sockets/
│   └── index.js
│
├── swagger/
│   └── swagger.js
│
├── seed.js 
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── postman/
Installation
First install the project dependencies:

npm install
Create a .env file and add the required environment variables.

Then run the seed:

npm run seed
To start the project normally:

npm start
To start it using nodemon:

npm run dev
Server
The server runs on:

http://localhost:5000
Swagger documentation:

http://localhost:5000/api-docs
Health check:

http://localhost:5000/health
API Routes
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Categories
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
Events
GET    /api/events
POST   /api/events
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id
Registrations
POST   /api/events/:eventId/register
GET    /api/registrations/me
DELETE /api/registrations/:id
Announcements
GET  /api/events/:eventId/announcements
POST /api/events/:eventId/announcements
Health
GET /health
Event Filtering
The events endpoint supports:

category
city
dateFrom
dateTo
page
limit
sort
search
Example:

GET /api/events?city=Cairo
The response includes the total number of events, current page, total pages, and event data.

Authentication
The project uses JWT authentication.

There are two roles:

Admin
Attendee
Some operations are available only for admins, such as creating, updating, and deleting events and categories.

Event Registration
Users can register for events.

The project checks the event capacity before creating a registration.

It also protects the registration count from race conditions by using an atomic update.

If creating the registration fails after increasing the registration count, the count is rolled back.

Announcements
Admins can send announcements to an event.

Announcements are:

Saved in MongoDB.
Sent to users connected to the event room using Socket.io.
Users can also request previous announcements through the API.

Validation and Error Handling
The project uses express-validator to validate incoming data.

Invalid requests return a 422 response with validation errors.

The project also uses:

AppError
asyncHandler
Central error handling middleware
Testing
Run the tests using:

npm test
The project includes:

Unit Tests
Tests for:

AppError
asyncHandler
Integration Tests
Tests for the Events API, including:

Creating an event
Checking admin authorization
Listing events
Filtering events by city
Listing events without filters
Search with no results
Getting a missing event
The integration tests use mongodb-memory-server, so they do not need the real MongoDB database.

Test Result
After running:

npm test
Test Suites: 3 passed, 3 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        71.246 s
Ran all test suites.
Seed Data
The seed script creates:

Sample categories
Sample events
An admin user
Run it with:

npm run seed
Default admin:
EMAIL=admin@eventpulse.com
PASSWORD=123456
These values can be changed using the environment variables.

Deployment
The project can be deployed using MongoDB Atlas and Vercel.

Required environment variables include:

NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d

Postman
postman/EventPulse.postman_collection.json