# EventPulse — Event Management API

EventPulse is a REST API for managing events, users, registrations, and announcements.

The project uses JWT authentication, MongoDB, and Socket.io for real-time announcements.

## Features

* User registration and login
* JWT authentication with `admin` and `attendee` roles
* Categories CRUD
* Events CRUD
* Event filtering, search, pagination, and sorting
* Event registration with capacity control
* Prevent duplicate registrations
* Real-time announcements using Socket.io
* Centralized error handling
* Input validation
* Unit and integration tests
* Swagger and Postman documentation
* Health check endpoint
* Deployment on Vercel with MongoDB Atlas

## Tech Stack

* Node.js
* Express.js
* MongoDB & Mongoose
* Socket.io
* JWT
* bcrypt
* express-validator
* Jest & Supertest
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
│   ├── announcementRoutes.js
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

```bash
git clone https://github.com/malakazzam2009-alt/30907081204004-EventPulse
cd 30907081204004-EventPulse
npm install
```

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Run the seed:

```bash
npm run seed
```

Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## Main API Routes

### Authentication

| Method | Endpoint             | Access  |
| ------ | -------------------- | ------- |
| POST   | `/api/auth/register` | Public  |
| POST   | `/api/auth/login`    | Public  |
| GET    | `/api/auth/me`       | Private |

### Categories

| Method | Endpoint              | Access |
| ------ | --------------------- | ------ |
| GET    | `/api/categories`     | Public |
| POST   | `/api/categories`     | Admin  |
| PATCH  | `/api/categories/:id` | Admin  |
| DELETE | `/api/categories/:id` | Admin  |

### Events

| Method | Endpoint                        | Access  |
| ------ | ------------------------------- | ------- |
| GET    | `/api/events`                   | Public  |
| GET    | `/api/events/:id`               | Public  |
| POST   | `/api/events`                   | Admin   |
| PATCH  | `/api/events/:id`               | Admin   |
| DELETE | `/api/events/:id`               | Admin   |
| POST   | `/api/events/:eventId/register` | Private |

### Registrations

| Method | Endpoint                 | Access  |
| ------ | ------------------------ | ------- |
| GET    | `/api/registrations/my`  | Private |
| DELETE | `/api/registrations/:id` | Private |

### Announcements

| Method | Endpoint             | Access |
| ------ | -------------------- | ------ |
| GET    | `/api/announcements` | Public |
| POST   | `/api/announcements` | Admin  |

### Health

```text
GET /health
```

## Event Features

Events support:

* Category filtering
* City filtering
* Date filtering
* Search
* Pagination
* Sorting

Example:

```text
GET /api/events?city=Cairo
GET /api/events?search=react
GET /api/events?page=1&limit=10
```

## Authentication

The API uses JWT authentication.

There are two roles:

* `admin`
* `attendee`

Admin users can manage events, categories, and announcements.

## Real-Time Announcements

Socket.io is used to send announcements to users inside a specific event room.

Announcements are also saved in MongoDB so users can view previous announcements.

## Testing

Run:

```bash
npm test
```

The project includes unit and integration tests.

**35 tests passed successfully.**

## Swagger

API documentation is available at:

```text
/api-docs
```

## Deployment

The API is deployed on Vercel with MongoDB Atlas.

```text
https://30907081204004-event-pulse.vercel.app/
```

## Postman

The Postman collection and environment are available in:

```text
postman/
├── EventPluse.postman_collection.json
└── EventPluse dev.postman_environment.json
```

## Release

Version: **v1.0.0**
