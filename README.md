# Event Management API

A RESTful API for managing events and user registrations built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

- Create and manage events with capacity limits
- User registration system with duplicate prevention
- Prevent registration for past events or full events
- Event statistics and reporting
- Concurrent registration handling
- Custom sorting for upcoming events

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd event-management-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_management"
PORT=3000
```

### 4. Start the application
```bash
# Start PostgreSQL with Docker Compose and the server
npm run dev
```

This command will:
- Start PostgreSQL container via Docker Compose
- Run Prisma migrations
- Start the server with nodemon (auto-reload on changes)

### 5. (Optional) Seed sample data
```bash
npm run seed
```

## 🗂️ Project Structure
```
event-management-api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.js            # Seed script
├── src/
│   ├── config/
│   │   └── db.js          # Prisma client configuration
│   ├── controllers/
│   │   └── event.controller.js
│   ├── routes/
│   │   └── event.routes.js
│   └── server.js          # Main application entry
├── docker-compose.yml
├── .env
└── package.json
```

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### 1. Create Event

**POST** `/events`

Creates a new event with validation.

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00Z",
  "location": "Mumbai",
  "capacity": 500
}
```

**Success Response (201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 1,
    "title": "Tech Conference 2025",
    "dateTime": "2025-12-15T10:00:00.000Z",
    "location": "Mumbai",
    "capacity": 500,
    "createdAt": "2025-10-15T12:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Capacity must be between 1 and 1000"
}
```

### 2. Get Event Details

**GET** `/events/:id`

Retrieves event details with registered users.

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00.000Z",
  "location": "Mumbai",
  "capacity": 500,
  "createdAt": "2025-10-15T12:00:00.000Z",
  "registrations": [
    {
      "id": 1,
      "userId": 1,
      "registeredAt": "2025-10-15T13:00:00.000Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

### 3. Register for Event

**POST** `/events/register`

Registers a user for an event.

**Request Body:**
```json
{
  "eventId": 1,
  "userId": 1
}
```

**Success Response (201):**
```json
{
  "message": "Registration successful",
  "registration": {
    "id": 1,
    "userId": 1,
    "eventId": 1,
    "registeredAt": "2025-10-15T13:00:00.000Z"
  }
}
```

**Error Responses:**

*Already registered (409):*
```json
{
  "error": "User is already registered for this event"
}
```

*Event full (400):*
```json
{
  "error": "Event is at full capacity"
}
```

*Past event (400):*
```json
{
  "error": "Cannot register for past events"
}
```

### 4. Cancel Registration

**POST** `/events/cancel`

Cancels a user's event registration.

**Request Body:**
```json
{
  "eventId": 1,
  "userId": 1
}
```

**Success Response (200):**
```json
{
  "message": "Registration cancelled successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Registration not found"
}
```

### 5. List Upcoming Events

**GET** `/events/upcoming`

Returns all future events sorted by date (ascending), then location (alphabetically).

**Success Response (200):**
```json
{
  "events": [
    {
      "id": 2,
      "title": "AI Workshop",
      "dateTime": "2025-11-01T14:00:00.000Z",
      "location": "Bangalore",
      "capacity": 100
    },
    {
      "id": 1,
      "title": "Tech Conference 2025",
      "dateTime": "2025-12-15T10:00:00.000Z",
      "location": "Mumbai",
      "capacity": 500
    }
  ]
}
```

### 6. Event Statistics

**GET** `/events/:id/stats`

Returns registration statistics for an event.

**Success Response (200):**
```json
{
  "eventId": 1,
  "totalRegistrations": 125,
  "remainingCapacity": 375,
  "capacityUsedPercentage": 25.0
}
```

**Error Response (404):**
```json
{
  "error": "Event not found"
}
```

## 🧪 Testing the API

### Using cURL
```bash
# Create an event
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Music Festival","dateTime":"2025-11-20T18:00:00Z","location":"Delhi","capacity":1000}'

# Register for event
curl -X POST http://localhost:3000/events/register \
  -H "Content-Type: application/json" \
  -d '{"eventId":1,"userId":1}'

# Get upcoming events
curl http://localhost:3000/events/upcoming

# Get event stats
curl http://localhost:3000/events/1/stats
```

### Using Postman

Import the following endpoints into Postman and test with the request/response examples above.

## 🔒 Business Logic & Validation

- ✅ Event capacity limited to 1-1000
- ✅ No duplicate registrations per user/event
- ✅ Cannot register for past events
- ✅ Cannot register when event is full
- ✅ Concurrent registration handling with database constraints
- ✅ Proper HTTP status codes for all scenarios
- ✅ Input validation for all endpoints

## 🐳 Docker Configuration

The `docker-compose.yml` sets up PostgreSQL:
```yaml
name: ApiFlow
services:
  db:
    image: postgres:latest
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=event_management
    ports:
      - 5432:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🛑 Stopping the Application
```bash
# Stop the server (Ctrl+C in terminal)

# Stop and remove Docker containers
docker-compose down

# Stop and remove with volumes (clears database)
docker-compose down -v
```

## 📦 Available Scripts
```bash
npm run dev      # Start Docker + server with nodemon
npm run seed     # Populate database with sample data
npm start        # Start server (production)
```

## 🔧 Troubleshooting

### Port 5432 already in use
Change the port in `docker-compose.yml`:
```yaml
ports:
  - 5433:5432  # Use 5433 instead
```
Update `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/event_management"
```

### Prisma Client not generated
```bash
npx prisma generate
```

### Database connection issues
Ensure Docker container is running:
```bash
docker ps
```

## 👨‍💻 Author

Kazi Abul Hasib

