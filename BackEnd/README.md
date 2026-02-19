# FitnessBuddy Backend API

Complete Node.js/Express REST API server for the FitnessBuddy fitness social platform. Provides endpoints for workouts, challenges, buddies, and real-time data synchronization.

## 🚀 Quick Start

```bash
cd BackEnd
npm install
npm run dev
```

Server runs on `http://localhost:5000`

## 📋 Features

### ✅ Core API Endpoints
- **User Profiles** - CRUD operations with avatar upload
- **Workout Management** - Log, track, and share workouts
- **Challenge System** - Create, join, and track challenges (NEW)
- **Buddy System** - Connect with other fitness enthusiasts
- **Messaging** - Real-time chat between buddies
- **Leaderboard** - Rankings and achievements
- **Gym Finder** - Search nearby fitness venues via Google Places API

### ✨ Enhanced Features (v2.0.0)
- **Challenge Duration Tracking** - Auto status (ongoing/ended)
- **Progress Updates** - Real-time participation progress
- **Owner/Participant Roles** - Distinguish challenge creators from members
- **Activity Visibility** - View all participants and their progress
- **Buddy Activity Feed** - See what buddies are sharing

## 🛠️ Tech Stack
- Read/unread message tracking
- Workout statistics aggregation

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_places_api_key
```

### 3. Run Server
**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000`

### 4. Test API
```bash
# Health check
curl http://localhost:5000/health

# Get all profiles
curl http://localhost:5000/api/profiles

# Get leaderboard
curl "http://localhost:5000/api/leaderboard?type=points&limit=10"
```

## API Endpoints

### Profile Management
```
GET    /api/profiles                    Get all profiles
GET    /api/profiles/:userId            Get single profile
PUT    /api/profiles/:userId            Update profile
DELETE /api/profiles/:userId            Delete profile
GET    /api/profiles/search/query       Search profiles
```

### Workouts
```
POST   /api/workouts                    Create workout
GET    /api/workouts/all                Get all workouts
GET    /api/workouts/user/:userId       Get user workouts
GET    /api/workouts/stats/:userId      Get workout stats
PUT    /api/workouts/:workoutId         Update workout
DELETE /api/workouts/:workoutId         Delete workout
```

### Goals
```
POST   /api/goals                       Create goal
GET    /api/goals/all                   Get all goals
GET    /api/goals/user/:userId          Get user goals
PUT    /api/goals/:goalId               Update goal
PUT    /api/goals/:goalId/progress      Update progress
PUT    /api/goals/:goalId/complete      Complete goal
DELETE /api/goals/:goalId               Delete goal
```

### Achievements
```
POST   /api/achievements                Create achievement
GET    /api/achievements/all            Get all achievements
GET    /api/achievements/user/:userId   Get user achievements
GET    /api/achievements/counts         Get badge counts
DELETE /api/achievements/:achievementId Delete achievement
```

### Buddy System
```
POST   /api/buddies                     Create request
GET    /api/buddies/user/:userId        Get buddies
GET    /api/buddies/pending/:userId     Get pending requests
POST   /api/buddies/accept              Accept request
POST   /api/buddies/reject              Reject request
POST   /api/buddies/remove              Remove buddy
```

### Chat
```
POST   /api/chat/send                   Send message
GET    /api/chat/conversation/:userId/:buddyId  Get conversation
GET    /api/chat/user/:userId           Get user chats
GET    /api/chat/unread/:userId         Get unread count
PUT    /api/chat/:messageId/read        Mark as read
PUT    /api/chat/conversation/:userId/:senderId/read  Mark conversation read
DELETE /api/chat/:messageId             Delete message
```

### Leaderboard
```
GET    /api/leaderboard                 Global leaderboard
GET    /api/leaderboard/rank/:userId    Get user rank
GET    /api/leaderboard/cohort/:userId  Buddy leaderboard
```

### Gyms
```
GET    /api/gyms/nearby?lat=X&lng=Y     Find nearby gyms
```

## Database Integration

The backend uses **Supabase** (PostgreSQL) as the database:
- User profiles and authentication
- Workout tracking
- Goal management
- Achievement system
- Buddy connections
- Chat messages
- Leaderboard data

All database operations use the Supabase client with proper error handling.

## Points System

The leaderboard uses an intelligent points calculation:

```
Points = (Workouts Count × 10) + (Total Minutes × 1) + (Total Calories × 0.1)
```

**Example:**
- User logs 5 workouts
- Total 200 minutes
- Total 2500 calories burned
- **Points = (5 × 10) + (200 × 1) + (2500 × 0.1) = 500**

## Response Format

### Success Response
```json
{
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Key Controllers

### Profile Controller
Handles user profile management, search, and retrieval

### Workout Controller
CRUD operations for workouts, with stats aggregation

### Goals Controller
Goal creation, progress tracking, and completion

### Achievements Controller
Achievement/badge management and counting

### Buddy Controller
Buddy requests, acceptance, rejection, and removal

### Chat Controller
Message sending, conversation retrieval, read status

### Leaderboard Controller
Global rankings, user ranks, and cohort leaderboards

### Gym Controller
Integration with Google Places API for nearby gyms

## Environment Setup

### Required Variables
```env
PORT=5000                           # Express server port
SUPABASE_URL=https://xxx.supabase.co  # Your Supabase URL
SUPABASE_SERVICE_ROLE_KEY=xxx       # Service role key for admin operations
GOOGLE_API_KEY=xxx                  # Google Places API key
```

### Getting Credentials

1. **Supabase**: https://app.supabase.com
   - Project settings → API
   - Copy the URL and service role key

2. **Google API**: https://console.cloud.google.com
   - Enable Places API
   - Create API key from credentials

## Development Tips

- Use `npm run dev` during development for auto-reload
- Check the `API_DOCUMENTATION.md` for detailed endpoint info
- All endpoints use async/await with proper error handling
- Database queries use Supabase RLS (Row Level Security)
- CORS is enabled for frontend communication

## Testing

Test endpoints using:
- **cURL** - Command line
- **Postman** - GUI tool
- **Thunder Client** - VS Code extension
- **npm requests** - Programmatically

## Production Deployment

1. Set environment variables on your hosting platform
2. Run `npm install` to install dependencies
3. Start with `npm start`
4. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "fitness-buddy-api"
   ```

## Troubleshooting

### Server won't start
- Check PORT is not in use
- Verify `.env` file exists
- Check SUPABASE_URL and keys are correct

### API returns 500 errors
- Check Supabase connection in console
- Verify RLS policies allow operations
- Check error details in server logs

### Database operations failing
- Ensure SUPABASE_SERVICE_ROLE_KEY is the service role (not anon key)
- Verify tables exist in Supabase
- Check RLS policies allow the operations

---

**Backend Complete!** 🎉 All endpoints implemented and ready for integration with the frontend.

4. **Start the server**
   ```bash
   npm start
   ```

   Server runs on `http://localhost:3001`

## 📁 Project Structure

```
BackEnd/
├── config/
│   └── supabaseClient.js       # Supabase client initialization
├── controllers/
│   └── gymControllers.js       # Gym API controller functions
├── routes/                      # API route definitions (if added)
├── app.js                      # Express app setup
├── server.js                   # Server entry point
└── package.json
```

## 🔧 Configuration Files

### `config/supabaseClient.js`
Initializes Supabase client with service key for:
- Database operations
- Admin-level access
- User management
- RLS policy enforcement

```javascript
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

### `app.js`
Configures Express with:
- CORS for frontend communication
- JSON body parsing
- Route middleware

### `server.js`
Main server entry point that:
- Loads environment variables
- Initializes Express app
- Starts listening on configured port

## 📡 API Endpoints

### Gym Finder Endpoints

#### GET `/api/gyms`
Fetch gyms near a location using Google Places API

**Query Parameters:**
- `lat` (required): Latitude of search location
- `lng` (required): Longitude of search location
- `radius` (optional): Search radius in meters (default: 5000)
- `type` (optional): Gym, yoga_studio, swimming_pool, etc.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "place_id",
      "name": "Gym Name",
      "address": "123 Main St",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "rating": 4.5,
      "reviews": 100,
      "types": ["gym", "health"],
      "phone": "+1-555-123-4567",
      "website": "https://gym.com"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🗄️ Supabase Database Schema

### Key Tables

#### Profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  age INTEGER,
  location TEXT,
  goal TEXT,
  workout TEXT,
  weekly_goal INTEGER DEFAULT 150,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workouts
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  distance DECIMAL,
  calories INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target INTEGER NOT NULL,
  unit TEXT NOT NULL,
  duration TEXT NOT NULL,
  reward_badge TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Challenge Members
```sql
CREATE TABLE challenge_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
```

#### Buddies
```sql
CREATE TABLE buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, buddy_id)
);
```

#### Chat Messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Saved Gyms
```sql
CREATE TABLE saved_gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id TEXT NOT NULL,
  gym_name TEXT NOT NULL,
  gym_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, gym_id)
);
```

## 🔐 Row-Level Security Policies

### Profiles RLS
```sql
-- Users can view all profiles (for discovery)
CREATE POLICY "View profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can update only their own profile
CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Workouts RLS
```sql
-- Users can CRUD only their own workouts
CREATE POLICY "Workouts policy" ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Chat Messages RLS
```sql
-- Users can view their own messages
CREATE POLICY "View messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can insert their own messages
CREATE POLICY "Send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

## 🔄 Authentication Flow

### JWT Token Validation
All authenticated requests should include:
```
Authorization: Bearer {jwt_token}
```

The token is obtained from Supabase Auth and contains:
- `sub`: User UUID
- `email`: User email
- `exp`: Expiration time
- `iat`: Issued at time

### Frontend to Backend Flow
1. Frontend authenticates with Supabase Auth
2. Frontend receives JWT token
3. Frontend includes token in API requests
4. Backend validates token against Supabase
5. Backend performs RLS-protected queries

## 🌐 CORS Configuration

Backend allows requests from:
- `http://localhost:5173` (local dev)
- `http://localhost:3000` (alternative)
- Production frontend URL (add in production)

Update in `app.js`:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-frontend-domain.com"
  ],
  credentials: true
}));
```

## 📊 Gym Controller Reference

### File: `controllers/gymControllers.js`

#### `getGyms(req, res)`
Fetches nearby gyms from Google Places API

**Input:**
- `lat`: Latitude
- `lng`: Longitude
- `radius`: Search radius (meters)

**Output:**
- Array of gym objects with details

**Error Handling:**
- Missing coordinates validation
- Google API errors
- Rate limiting handling

**Example Usage:**
```javascript
// Frontend
const response = await axios.get('/api/gyms', {
  params: {
    lat: 40.7128,
    lng: -74.0060,
    radius: 5000,
    type: 'gym'
  }
});
```

## 🚢 Deployment

### Deploy to Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
heroku config:set GOOGLE_PLACES_API_KEY=your_key

# Deploy
git push heroku main
```

### Deploy to Railway
1. Connect GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Railway auto-deploys on push

### Deploy to AWS/DigitalOcean
1. Create cloud VM instance
2. Clone repository
3. Install Node.js
4. Install dependencies: `npm install`
5. Set environment variables
6. Start server: `npm start`
7. Use PM2 for process management: `pm2 start server.js`
8. Configure Nginx as reverse proxy

## ⚙️ Build Scripts

```bash
# Development
npm start           # Start server with Node
npm run dev         # Start with nodemon (auto-restart on changes)

# Production
npm run build       # Build (if applicable)
npm run prod        # Start in production mode
```

Install nodemon for development:
```bash
npm install --save-dev nodemon
```

Update `package.json`:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "prod": "NODE_ENV=production node server.js"
}
```

## 🔗 Frontend Integration

### Base URL Configuration
Frontend calls backend at:
```javascript
const API_URL = process.env.VITE_API_URL || "http://localhost:3001";

// Example request
const response = await axios.get(`${API_URL}/api/gyms`, {
  params: { lat: 40.7128, lng: -74.0060 }
});
```

### Error Handling
Frontend should handle:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid token)
- 404: Not Found (endpoint missing)
- 500: Server Error
- Network timeouts

## 🐛 Debugging

### Enable Debug Logs
Set environment variable:
```bash
DEBUG=* npm start
```

### Check Database Connection
```javascript
const supabase = require("./config/supabaseClient");

supabase.from("profiles").select("*").limit(1).then(console.log);
```

### Check Google API Key
Test in browser:
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.7128,-74.0060&radius=5000&type=gym&key=YOUR_API_KEY
```

## 📡 Environment Variables Reference

```env
# Supabase Setup
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs... (service role key)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... (anon key)

# Google Places API
GOOGLE_PLACES_API_KEY=AIzaSyD...

# Server Configuration
PORT=3001
NODE_ENV=development
```

## 🤝 API Documentation

### Headers Required
```
Content-Type: application/json
Authorization: Bearer {jwt_token} (for protected routes)
```

### Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

## 📦 Dependencies

```json
{
  "express": "^4.x",
  "@supabase/supabase-js": "^2.x",
  "cors": "^2.x",
  "axios": "^1.x",
  "dotenv": "^16.x"
}
```

## 📄 License

MIT License - See LICENSE file for details

## 👤 Support

For issues:
1. Check server logs: `npm start` with debug mode
2. Verify environment variables are set
3. Test Supabase connection
4. Check Google API quota and permissions
5. Review CORS settings

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Places API](https://developers.google.com/maps/documentation/places)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)
