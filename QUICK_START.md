# Fitness Buddy App - Quick Start Guide

## 🚀 Getting Started

Your Fitness Buddy App is ready to run! Here's everything you need to do:

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Supabase Account (Free tier available)

---

## 📋 Step 1: Run Setup Script (Recommended)

### On Windows:
```bash
.\setup.bat
```

### On Mac/Linux:
```bash
bash setup.sh
```

This will automatically install all dependencies.

---

## ⚙️ Step 2: Verify Environment Variables

### Frontend (.env.local)
Located in `FrontEnd/.env.local`:
```
VITE_SUPABASE_URL=https://uiradpgawcuoxybsjjhw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### Backend (.env)
Located in `BackEnd/.env`:
```
PORT=5000
SUPABASE_URL=https://uiradpgawcuoxybsjjhw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

---

## 🗄️ Step 3: Set Up Supabase Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content from `SUPABASE_SCHEMA.sql`
5. Paste into the SQL editor
6. Click **Run**

✅ All tables created!

---

## 🚀 Step 4: Start the Application

Open **2 Terminal Windows**:

### Terminal 1 - Backend:
```bash
cd BackEnd
npm run dev
```
Backend runs on: `http://localhost:5000`

### Terminal 2 - Frontend:
```bash
cd FrontEnd
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🎯 Step 5: Test the App

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" to create an account
3. Enter email and password
4. Complete your profile
5. Start logging workouts, setting goals, and finding fitness buddies!

---

## 📱 Features Available

✅ **Authentication**
- Email/Password Sign Up & Login
- Google OAuth
- Facebook OAuth
- Password Reset

✅ **User Profiles**
- Complete fitness profile setup
- Avatar upload
- Geolocation tracking
- Fitness goals and preferences

✅ **Workout Tracking**
- Log workouts with duration, distance, calories
- Weekly statistics
- Confetti celebration on milestones
- Social media sharing

✅ **Fitness Goals**
- Create custom fitness goals
- Track progress with visual indicators
- Automatic badge rewards
- Goal completion tracking

✅ **Community Features**
- Find fitness buddies based on compatibility
- Send buddy requests
- Direct messaging with buddies
- Gym finder with location-based search
- Challenges and competitions
- Leaderboard rankings

✅ **Achievements**
- Unlock badges as you progress
- Track achievement statistics
- Achievement rarity levels

---

## 🐛 Troubleshooting

### Port Already in Use
Change port in Backend/.env:
```
PORT=5001
```

### Supabase Connection Error
- Check `.env` files have correct URLs
- Verify API keys are valid
- Try refreshing the page

### Frontend won't load
- Clear browser cache (Ctrl+Shift+Delete)
- Restart the dev server
- Check console for errors (F12)

### Database queries failing
- Verify RLS policies are enabled in Supabase
- Check Row Level Security settings
- Confirm auth is working

---

## 📞 Support

For issues, check:
1. Browser console for errors (F12)
2. Supabase logs and SQL editor
3. Backend terminal output
4. SETUP_GUIDE.md for detailed setup

---

## 🎉 You're All Set!

Your Fitness Buddy App is now running with all features enabled. Happy tracking! 💪
