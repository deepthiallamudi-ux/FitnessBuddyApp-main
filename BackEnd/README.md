# Fitness Buddy - Backend

Express.js server for the Fitness Buddy application. Provides API endpoints, integrations with Google Places API for gym discovery, and Supabase database management.

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+ 
- **Framework**: Express.js 4.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT tokens)
- **Gym Data**: Google Places API
- **API Client**: Axios
- **Middleware**: CORS, body-parser, dotenv
- **Environment**: Node environment management

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Supabase project and credentials
- Google Places API key
- Environment variables configured

## 🚀 Installation

1. **Navigate to BackEnd directory**
   ```bash
   cd BackEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with required variables:
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Places API
   GOOGLE_PLACES_API_KEY=your_google_places_api_key

   # Server
   PORT=3001
   NODE_ENV=development
   ```

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
