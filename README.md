# Fitness Buddy App

A modern, full-stack fitness social platform where users can connect with fitness enthusiasts, track workouts, join challenges, and achieve health goals together.

![Fitness Buddy](https://img.shields.io/badge/status-active-success) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Node.js](https://img.shields.io/badge/Node.js-16+-green) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)

## 🎯 Overview

Fitness Buddy is a comprehensive fitness social network that combines workout tracking, buddy matching, community challenges, and real-time communication. The app uses modern web technologies to provide a seamless user experience with beautiful animations and a responsive design.

### Key Highlights
- ✅ Full-stack application (Frontend + Backend + Database)
- ✅ Real-time messaging and notifications
- ✅ Sophisticated buddy matching algorithm
- ✅ Community-driven challenges and leaderboards
- ✅ Mobile-responsive design with dark mode
- ✅ Secure authentication with Supabase

## 📋 What Users Can Do

1. **Authentication & Profiling**
   - Sign up with email, Google, or Facebook
   - Create detailed fitness profiles
   - Upload and manage profile avatars
   - Set fitness goals and preferences

2. **Workout Management**
   - Log workouts with type, duration, distance
   - Auto-calculated calorie burning
   - View workout history and statistics
   - Track weekly goal progress

3. **Social Features**
   - Discover compatible fitness buddies
   - Send and receive buddy requests
   - Real-time chat with connected buddies
   - View buddy profiles and goals

4. **Challenges & Competitions**
   - Browse community challenges
   - Join/create fitness challenges
   - Track personal progress
   - Earn reward badges
   - Compete on leaderboards (individual & group)

5. **Gym Discovery**
   - Find nearby fitness venues
   - Filter by gym type (gym, yoga, cycling, CrossFit, etc.)
   - Save favorite gyms
   - Get directions via Google Maps

6. **Gamification**
   - Earn achievements and badges
   - Track points and rankings
   - Join fitness groups
   - Celebrate milestones

## 🛠️ Tech Stack

### Frontend
```
React 18.2.0 + Vite 5.2.0    // UI Framework
Tailwind CSS 3.4.1            // Styling 
Framer Motion 10.16.4        // Animations
Supabase JS 2.x               // Database Client
Axios                         // HTTP Client
Lucide React                  // Icons
React Router DOM v6           // Routing
React Confetti               // Effects
Recharts                     // Charts
```

### Backend
```
Express.js 4.x               // API Framework
Node.js 16+                  // Runtime
Supabase Admin Client        // Database Admin
Axios                        // HTTP Requests
Google Places API            // Gym Data
CORS, dotenv                 // Middleware
```

### Database & Infrastructure
```
Supabase (PostgreSQL)        // Database & Auth
Supabase Storage             // File Storage (Avatars)
Google Places API            // Location Services
JWT Authentication           // Security
```

## 📁 Project Structure

```
FitnessBuddyApp-main/
├── FrontEnd/                     # React application
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context (Auth, Theme)
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Supabase client
│   │   ├── pages/               # Page components (11 pages)
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── BackEnd/                      # Express.js server
│   ├── config/
│   │   └── supabaseClient.js
│   ├── controllers/
│   │   └── gymControllers.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── SUPABASE_SCHEMA.sql          # Database schema & RLS policies
├── SUPABASE_RLS_FIX.sql         # RLS fixes (run if needed)
├── README.md                    # This file
├── SETUP_GUIDE.md              # Detailed setup instructions
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account ([Create here](https://supabase.com))
- Google Places API key ([Get here](https://developers.google.com/maps/documentation/places))

### 1. Clone Repository
```bash
git clone <repository-url>
cd FitnessBuddyApp-main
```

### 2. Frontend Setup
```bash
cd FrontEnd
npm install

# Create .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
EOF

npm run dev  # Runs on http://localhost:5173
```

### 3. Backend Setup
```bash
cd ../BackEnd
npm install

# Create .env
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
GOOGLE_PLACES_API_KEY=your_api_key
PORT=3001
NODE_ENV=development
EOF

npm start  # Runs on http://localhost:3001
```

### 4. Database Setup
1. Go to [Supabase Console](https://app.supabase.com)
2. Select your project
3. Go to SQL Editor
4. Execute SQL from `SUPABASE_SCHEMA.sql`
5. Optionally run `SUPABASE_RLS_FIX.sql` for RLS fixes

## 📊 Database Schema

### Core Tables
- **profiles** - User information and settings
- **workouts** - Logged exercise sessions
- **challenges** - Community fitness challenges
- **challenge_members** - User challenge participation
- **buddies** - User connections
- **chat_messages** - Direct messages
- **saved_gyms** - User's favorite gyms
- **achievements** - User badges and milestones
- **fitness_goals** - Personal goals
- **workout_groups** - Group challenges

All tables include Row-Level Security (RLS) policies for data protection.

## 🔐 Authentication

### Supported Methods
- Email/Password
- Google OAuth
- Facebook OAuth
- Password Recovery

### JWT Token Flow
1. User signs up/logs in with Supabase
2. Supabase returns JWT token
3. Frontend stores token in localStorage
4. Backend validates token for API requests
5. RLS policies enforce data isolation

## 🎨 Design System

### Color Palette
```
Primary:   #0F2A1D (Dark Forest Green)
Secondary: #6B9071 (Medium Green)  
Dark:      #375534 (Deep Green)
Accent:    #AEC3B0 (Light Sage)
Light:     #E3EED4 (Cream)
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Animations
- Page Transitions: 500ms spring animation
- Button Hovers: 1.05x scale
- Background: 15-20s loop animations
- Messages: 0.3s spring scale-in

## 📖 Pages Overview

| Page | Features | Status |
|------|----------|--------|
| **Dashboard** | Quick links, stats summary | ✅ Complete |
| **Profile** | Edit info, avatar upload | ✅ Complete |
| **Workouts** | Log workouts, view history | ✅ Complete |
| **Goals** | Create & track goals | ✅ Complete |
| **Buddies** | Matching, connect, chat | ✅ Complete |
| **Challenges** | Browse, join, track progress | ✅ Complete |
| **Leaderboard** | Rankings, group join | ✅ Complete |
| **Chat** | Real-time messaging | ✅ Complete |
| **Gym Finder** | Search, save, unsave | ✅ Complete |
| **Achievements** | Badges, milestones | ✅ Complete |
| **Resources** | Tips & guides | ✅ Complete |
| **Login** | Auth, password recovery | ✅ Complete |

## 🚢 Deployment

### Backend Deployment Options

**Heroku**
```bash
heroku create your-app
heroku config:set SUPABASE_URL=... SUPABASE_KEY=... GOOGLE_PLACES_API_KEY=...
git push heroku main
```

**Railway / Render / Fly.io**
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push

**VPS (DigitalOcean / AWS)**
```bash
npm install
npm start  # or use PM2
# Configure Nginx/Apache as reverse proxy
```

### Frontend Deployment Options

**Vercel (Recommended)**
```bash
npm install -g vercel
vercel
# Set environment variables in Vercel dashboard
```

**Netlify**
- Connect GitHub repo
- Build command: `npm run build`
- Publish directory: `dist`

**AWS Amplify / Firebase Hosting**
- Connect GitHub repo
- Auto-deploy on push

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

**Backend (.env)**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
GOOGLE_PLACES_API_KEY=your_api_key
PORT=3001
NODE_ENV=development
```

## 🎯 Key Features Implementation

### Real-time Chat
- Supabase real-time subscriptions
- PostgreSQL change events
- Message history persistence
- Automatic typing indicators

### Buddy Matching Algorithm
- Goal similarity scoring
- Workout preference matching
- Location proximity calculation
- Weekly goal alignment
- Composite match score (0-10)

### Leaderboard Ranking
- Points calculation: (Workouts × 10) + (Minutes × 1) + (Calories × 0.1)
- Real-time ranking updates
- Group vs individual modes
- Historical rank tracking

### Challenge System
- Progress tracking per member
- Configurable targets and units
- Reward badge system
- Difficulty levels

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
- Clear browser cache: Cmd+Shift+Delete
- Check Supabase URL and keys
- Verify auth policies in Supabase

**Database Connection Issues**
- Check Supabase project is active
- Verify service role key has admin access
- Check network connectivity

**API Not Connecting**
- Ensure backend is running on port 3001
- Check CORS settings in Express
- Verify frontend API_URL configuration

**Gmail/OAuth Issues**
- Verify OAuth credentials in Supabase
- Check redirect URLs match exactly
- Ensure APIs are enabled in Google Console

## 📚 Documentation

- [Frontend README](./FrontEnd/README.md) - React app documentation
- [Backend README](./BackEnd/README.md) - Express server documentation
- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [Schema Documentation](./SUPABASE_SCHEMA.sql) - Database schema
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🌐 Live Demo

[Deploy your app and add live link here]

## 👤 Support & Contact

- **Issues**: GitHub Issues
- **Email**: [your-email@example.com]
- **Discord**: [your-discord-server]

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Database powered by Supabase
- Animations by Framer Motion
- Icons from Lucide React
- UI inspired by modern fitness apps

## 📈 Roadmap

### Phase 1 ✅ Complete
- Core authentication
- Profile management
- Workout logging
- Buddy system
- Challenges
- Leaderboards

### Phase 2 (Planned)
- Advanced analytics dashboard
- Fitness plan recommendations
- Social feed/timeline
- Live workout groups
- Mobile app (React Native)
- Video workouts library
- Wearable integration (Fitbit, Apple Watch)

### Phase 3 (Future)
- AI workout recommendations
- Nutrition tracking
- Gym partnerships
- Communities/clubs
- Premium features
- API for third-party apps

---

**Last Updated**: 2024
**Version**: 1.0.0

Made with ❤️ for fitness enthusiasts
