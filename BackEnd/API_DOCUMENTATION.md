# Backend API Documentation

## Overview
Complete REST API for Fitness Buddy App with endpoints for profiles, workouts, goals, achievements, buddy system, chat, and leaderboard.

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### Health Check
```
GET /health
```
**Response:** `{ "status": "ok" }`

---

## Profiles

### Get All Profiles
```
GET /api/profiles
```
**Response:** Array of all user profiles

### Get Single Profile
```
GET /api/profiles/:userId
```
**Response:** User profile object

### Update Profile
```
PUT /api/profiles/:userId
```
**Body:**
```json
{
  "username": "string",
  "email": "string",
  "age": "number",
  "location": "string",
  "goal": "string",
  "workout": "string",
  "bio": "string",
  "latitude": "number",
  "longitude": "number"
}
```

### Delete Profile
```
DELETE /api/profiles/:userId
```

### Search Profiles
```
GET /api/profiles/search/query?query=searchTerm
```
**Response:** Array of matching profiles (searches username, location, goal, workout)

---

## Workouts

### Create Workout
```
POST /api/workouts
```
**Body:**
```json
{
  "userId": "uuid",
  "type": "string",
  "duration": "number (minutes)",
  "distance": "number (km)",
  "calories": "number",
  "notes": "string"
}
```

### Get All Workouts
```
GET /api/workouts/all
```

### Get User Workouts
```
GET /api/workouts/user/:userId?limit=50&offset=0
```

### Get Workout Stats
```
GET /api/workouts/stats/:userId
```
**Response:**
```json
{
  "totalWorkouts": "number",
  "totalDuration": "number",
  "totalDistance": "number",
  "totalCalories": "number",
  "averageDuration": "number"
}
```

### Update Workout
```
PUT /api/workouts/:workoutId
```
**Body:** Same as create

### Delete Workout
```
DELETE /api/workouts/:workoutId
```

---

## Goals

### Create Goal
```
POST /api/goals
```
**Body:**
```json
{
  "userId": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "goal_type": "daily|weekly|monthly",
  "target": "number",
  "unit": "string",
  "deadline": "date"
}
```

### Get All Goals
```
GET /api/goals/all
```

### Get User Goals
```
GET /api/goals/user/:userId
```

### Update Goal
```
PUT /api/goals/:goalId
```
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "target": "number",
  "current": "number",
  "completed": "boolean",
  "deadline": "date"
}
```

### Update Goal Progress
```
PUT /api/goals/:goalId/progress
```
**Body:** `{ "current": "number" }`

### Complete Goal
```
PUT /api/goals/:goalId/complete
```

### Delete Goal
```
DELETE /api/goals/:goalId
```

---

## Achievements

### Create Achievement
```
POST /api/achievements
```
**Body:**
```json
{
  "userId": "uuid",
  "achievement": "string",
  "badge_type": "string"
}
```

### Get All Achievements
```
GET /api/achievements/all
```

### Get User Achievements
```
GET /api/achievements/user/:userId
```

### Get Achievement Counts
```
GET /api/achievements/counts
```
**Response:** Object with badge_type counts

### Delete Achievement
```
DELETE /api/achievements/:achievementId
```

---

## Buddy System

### Create Buddy Request
```
POST /api/buddies
```
**Body:**
```json
{
  "userId": "uuid",
  "buddyId": "uuid"
}
```

### Get User Buddies
```
GET /api/buddies/user/:userId?status=connected
```
**Query Params:** `status` - "connected", "pending" (default: "connected")
**Response:** Array of buddy profiles

### Get Pending Buddy Requests
```
GET /api/buddies/pending/:userId
```
**Response:** Array of user profiles who sent requests

### Accept Buddy Request
```
POST /api/buddies/accept
```
**Body:**
```json
{
  "userId": "uuid",
  "buddyId": "uuid"
}
```

### Reject Buddy Request
```
POST /api/buddies/reject
```
**Body:**
```json
{
  "userId": "uuid",
  "buddyId": "uuid"
}
```

### Remove Buddy
```
POST /api/buddies/remove
```
**Body:**
```json
{
  "userId": "uuid",
  "buddyId": "uuid"
}
```

---

## Chat

### Send Message
```
POST /api/chat/send
```
**Body:**
```json
{
  "senderId": "uuid",
  "receiverId": "uuid",
  "message": "string"
}
```

### Get Conversation
```
GET /api/chat/conversation/:userId/:buddyId?limit=50&offset=0
```

### Get User Chats
```
GET /api/chat/user/:userId
```
**Response:** Array of user profiles (chat partners)

### Get Unread Count
```
GET /api/chat/unread/:userId
```
**Response:** `{ "unreadCount": "number" }`

### Mark Message as Read
```
PUT /api/chat/:messageId/read
```

### Mark Conversation as Read
```
PUT /api/chat/conversation/:userId/:senderId/read
```

### Delete Message
```
DELETE /api/chat/:messageId
```

---

## Leaderboard

### Get Global Leaderboard
```
GET /api/leaderboard?type=points&limit=100
```
**Query Params:**
- `type`: "points" (default), "calories", "minutes", "workouts"
- `limit`: Number of top users to return

**Response:**
```json
[
  {
    "rank": 1,
    "id": "uuid",
    "username": "string",
    "avatar_url": "string",
    "goal": "string",
    "workouts": "number",
    "minutes": "number",
    "calories": "number",
    "points": "number"
  }
]
```

### Get User Rank
```
GET /api/leaderboard/rank/:userId?type=points
```
**Response:**
```json
{
  "rank": "number",
  "user": { "...profile object..." }
}
```

### Get Cohort Leaderboard
```
GET /api/leaderboard/cohort/:userId?limit=50
```
**Response:** Leaderboard of user's buddies only

---

## Gyms

### Get Nearby Gyms
```
GET /api/gyms/nearby?lat=latitude&lng=longitude
```
**Query Params:**
- `lat`: Latitude coordinate
- `lng`: Longitude coordinate

**Response:** Array of nearby gyms from Google Places API

---

## Error Handling

All endpoints return error responses in this format:
```json
{
  "error": "Error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad request
- 404: Not found
- 500: Server error

---

## Points Calculation

Points are calculated as:
```
points = (workouts × 10) + (minutes × 1) + (calories × 0.1)
```

Example:
- 5 workouts
- 200 minutes
- 2500 calories
- **Points = (5 × 10) + (200 × 1) + (2500 × 0.1) = 50 + 200 + 250 = 500 points**

---

## Environment Variables

Ensure your `.env` file has:
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_places_api_key
```

---

## Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000` by default.
