# Backend Testing Guide for Fitness Buddy App

## Backend Server Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and database

### Environment Setup

1. **Navigate to Backend Directory**
```bash
cd BackEnd
```

2. **Create `.env` file in the BackEnd folder**
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
PORT=5000
NODE_ENV=development
```

3. **Install Dependencies**
```bash
npm install
```

### Starting the Backend Server

**Development Mode (recommended for testing):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server should start on `http://localhost:3001`

---

## Backend API Endpoints

### Base URL
```
http://localhost:3001
```

### Gym Controller Endpoints

#### 1. Get All Gyms
```
GET /api/gyms
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Gym Name",
    "location": "Address",
    "rating": 4.5,
    "amenities": ["equipment1", "equipment2"]
  }
]
```

#### 2. Get Gyms by Location
```
GET /api/gyms/location?lat=40.7128&lng=-74.0060&radius=5
```
**Query Parameters:**
- `lat` (float): Latitude
- `lng` (float): Longitude
- `radius` (number): Search radius in km

#### 3. Search Gyms
```
GET /api/gyms/search?query=gym%20name
```

---

## Testing with Postman / cURL

### Example 1: Test Gym API
```bash
curl -X GET "http://localhost:3001/api/gyms" \
  -H "Content-Type: application/json"
```

### Example 2: Search Nearby Gyms
```bash
curl -X GET "http://localhost:3001/api/gyms/location?lat=40.7128&lng=-74.0060&radius=5" \
  -H "Content-Type: application/json"
```

---

## Testing Database Connection

### Test Supabase Connection

1. **Check Supabase Configuration**
   - Verify `SUPABASE_URL` is correct
   - Verify `SUPABASE_KEY` is the anon key (not service role key)

2. **Test Connection from Backend**
```javascript
// Add this to app.js temporarily
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Test query
const { data, error } = await supabase.from('profiles').select('*').limit(1)
if (error) console.error('Connection error:', error)
else console.log('Connection successful:', data)
```

---

## Frontend Integration Testing

### Configure Frontend to Use Backend

1. **Update Frontend API Base URL** (`src/lib/supabase.js`)
```javascript
// Set the backend URL for API calls
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001'
```

2. **Test API Calls from Console**
```javascript
// Open browser console and run:
fetch('http://localhost:3001/api/gyms')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

---

## Running Tests

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'supabase'"
**Solution:**
```bash
npm install @supabase/supabase-js
```

### Issue 2: Backend not starting (Cannot bind to port 3001)
**Solution:**
```bash
# Check if port is in use
netstat -ano | findstr :3001

# Use different port
PORT=3002 npm run dev
```

### Issue 3: CORS errors when calling from frontend
**Solution:** Add CORS middleware to backend app.js:
```javascript
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}))
```

### Issue 4: Supabase connection fails
**Solution:**
1. Verify credentials in `.env`
2. Check Supabase project is active
3. Verify API key has proper permissions
4. Check database tables exist

---

## Debugging

### Enable Debug Logging
```bash
DEBUG=* npm run dev
```

### Check Server Logs
- Look for errors in console
- Check network tab in DevTools
- Verify Supabase logs in dashboard

### Test Database Directly
```bash
# Use Supabase Dashboard or psql
psql <your-supabase-connection-string>
```

---

## API Response Testing Checklist

- [ ] Server starts without errors
- [ ] Can make GET request to /api/gyms
- [ ] Can search gyms by location
- [ ] Database queries return data
- [ ] CORS headers are correct
- [ ] Error handling works
- [ ] Response times < 1000ms

---

## Performance Testing

### Load Test with Apache Bench
```bash
ab -n 100 -c 10 http://localhost:3001/api/gyms
```

### Monitor Backend Performance
```bash
npm install -g clinic
clinic doctor -- npm run dev
```

---

## Deployment Notes

### Production Deployment
1. Set environment variables on hosting platform
2. Use production Supabase keys
3. Enable compression
4. Add rate limiting
5. Set up monitoring
6. Configure CORS for production domain

### Environment variables for production:
```
SUPABASE_URL=production_url
SUPABASE_KEY=production_key
PORT=3001
NODE_ENV=production
```

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Check code style |
| `npm run build` | Build for production |

---

## Support

For more information:
- Check [BackEnd/README.md](./BackEnd/README.md)
- Review [app.js](./BackEnd/app.js)
- Check Supabase documentation: https://supabase.com/docs
