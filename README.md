# EventPulse - Event Management Backend API

EventPulse is a backend project for managing events using Node.js, Express, MongoDB, and Socket.io.

## Features

* User registration and login using JWT
* Admin and attendee roles
* Categories management
* Events management
* Event filtering, pagination, sorting, and search
* Event registration
* Event capacity checking
* Real-time announcements using Socket.io
* Error handling and validation
* Automated tests
* Swagger API documentation

## Technologies

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.io
* JWT
* bcrypt
* express-validator
* Jest
* Supertest
* mongodb-memory-server
* Swagger

## Project Structure

```text
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
```

## Installation

Install the project dependencies:

```bash
npm install
```

Create a `.env` file and add the required environment variables.

Run the seed script:

```bash
npm run seed
```

Start the project normally:

```bash
npm start
```

Start the project using nodemon:

```bash
npm run dev
```

## Server

Local server:

```text
http://localhost:5000
```

Swagger documentation:

```text
http://localhost:5000/api-docs
```

Health check:

```text
http://localhost:5000/health
```

## Live Deployment

Live deployment:

```text
https://30907081204004-event-pulse.vercel.app/
```

Swagger documentation:

```text
https://30907081204004-event-pulse.vercel.app/api-docs
```

Health check:

```text
https://30907081204004-event-pulse.vercel.app/health
```

## API Routes

| Method | Endpoint                             | Description                      | Access        |
| ------ | ------------------------------------ | -------------------------------- | ------------- |
| POST   | `/api/auth/register`                 | Register a new user              | Public        |
| POST   | `/api/auth/login`                    | Login                            | Public        |
| GET    | `/api/auth/me`                       | Get current user                 | Authenticated |
| GET    | `/api/categories`                    | List categories                  | Public        |
| POST   | `/api/categories`                    | Create category                  | Admin         |
| PATCH  | `/api/categories/:id`                | Update category                  | Admin         |
| DELETE | `/api/categories/:id`                | Delete category                  | Admin         |
| GET    | `/api/events`                        | List events                      | Public        |
| POST   | `/api/events`                        | Create event                     | Admin         |
| GET    | `/api/events/:id`                    | Get event                        | Public        |
| PATCH  | `/api/events/:id`                    | Update event                     | Admin         |
| DELETE | `/api/events/:id`                    | Delete event                     | Admin         |
| POST   | `/api/events/:eventId/register`      | Register for event               | Authenticated |
| GET    | `/api/registrations/me`              | Get current user's registrations | Authenticated |
| DELETE | `/api/registrations/:id`             | Cancel registration              | Authenticated |
| GET    | `/api/events/:eventId/announcements` | Get announcement history         | Public        |
| POST   | `/api/events/:eventId/announcements` | Create announcement              | Admin         |
| GET    | `/health`                            | Health check                     | Public        |

## Event Filtering

The events endpoint supports:

* `category`
* `city`
* `dateFrom`
* `dateTo`
* `page`
* `limit`
* `sort`
* `search`

Example:

```text
GET /api/events?city=Cairo
```

The response includes the total number of events, current page, total pages, and event data.

## Authentication

The project uses JWT authentication.

There are two roles:

* Admin
* Attendee

Some operations are available only to admins, such as creating, updating, and deleting events and categories.

## Event Registration

Users can register for events.

The project checks the event capacity before creating a registration.

The registration count is protected against race conditions using an atomic database update.

If creating the registration fails after increasing the registration count, the count is rolled back.

## Announcements

Admins can send announcements to an event.

Announcements are:

* Saved in MongoDB
* Sent to users connected to the event room using Socket.io
* Available through the announcement history API

Users can request previous announcements through the API.

## Validation and Error Handling

The project uses `express-validator` to validate incoming data.

Invalid requests return a `422` response with validation errors.

The project also uses:

* `AppError`
* `asyncHandler`
* Central error handling middleware

## Testing

Run the complete test suite using:

```bash
npm test
```

The project includes unit and integration tests.

### Unit Tests

Tests cover:

* `AppError`
* `asyncHandler`

### Integration Tests

Tests cover the Events API, including:

* Creating an event
* Checking admin authorization
* Listing events
* Filtering events by city
* Listing events without filters
* Searching with no results
* Getting a missing event

The integration tests use `mongodb-memory-server`, so they do not require the real MongoDB database.

### Test Result

```text
Test Suites: 3 passed, 3 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        71.246 s
Ran all test suites.
```

## Seed Data

The seed script creates:

* Sample categories
* Sample events
* An admin user

Run it with:

```bash
npm run seed
```

Default admin credentials:

```text
EMAIL=admin@eventpulse.com
PASSWORD=Test123456
```

These values can be changed using environment variables.

## Environment Variables

The project requires the following environment variables:

```text
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

**Never commit the `.env` file or real credentials to GitHub.**

## Postman

The Postman collection is available at:

```text
postman/EventPulse.postman_collection.json
```

The recommended Postman environment name is:

```text
EventPulse Dev
```

## Release

Version `1.0.0`
