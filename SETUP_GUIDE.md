# Fitness Buddy App - Setup Guide

This guide will help you set up the Fitness Buddy App from scratch.

## Prerequisites

Before you start, make sure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for cloning the repository - [Download](https://git-scm.com/)
- A **Supabase** account (free tier) - [Sign up](https://supabase.com)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/FitnessBuddyApp.git
cd FitnessBuddyApp
```

## Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter your project details:
   - **Project name**: `FitnessBuddy` (or any name you prefer)
   - **Database password**: Create a strong password
   - **Region**: Choose nearest to you
4. Click "Create new project" and wait for it to set up

### 2.2 Create Database Tables
1. Once your project is ready, go to **SQL Editor**
2. Click **"New Query"**
3. Open the `SUPABASE_SCHEMA.sql` file from the project
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **"Run"** to execute all queries
7. Wait for all tables to be created ✅

### 2.3 Enable Authentication
1. Go to **Authentication** in the sidebar
2. Click **"Providers"**
3. Enable the following providers:
   - **Email** (should be enabled by default)
   - **Google** - Follow the setup instructions
   - **Facebook** - Follow the setup instructions
4. Save changes

### 2.4 Create Storage Bucket
1. Go to **Storage** in the sidebar
2. Click **"Create a new bucket"**
3. Name it: `avatars`
4. Make it **Public** (toggle on)
5. Click **"Create bucket"**

### 2.5 Get Your API Keys
1. Go to **Settings** (bottom of sidebar)
2. Click **"API"**
3. Under "Project API keys", copy:
   - **Project URL** - Copy this
   - **Anon Public** key - Copy this
4. Keep these safe - you'll need them next!

## Step 3: Set Up Frontend

### 3.1 Install Dependencies
```bash
cd FrontEnd
npm install
```

### 3.2 Create Environment Variables
Create a file named `.env.local` in the `FrontEnd` directory:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Supabase Project URL
- `your_anon_key_here` with your Supabase Anon Public key

### 3.3 Start the Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Step 4: Test the App

### 4.1 Create Your First Account
1. Open the app in your browser
2. Click "Sign Up"
3. Enter email and password
4. Click "Create Account"
5. Sign in with your credentials

### 4.2 Complete Your Profile
1. Go to **Profile** page
2. Fill in your details:
   - Username
   - Age
   - Location
   - Fitness Goal (e.g., Weight Loss)
   - Preferred Workout (e.g., Running)
   - Weekly Goal (e.g., 150 minutes)
   - Upload a profile picture (optional)
3. Click "Save Profile"

### 4.3 Log Your First Workout
1. Go to **Workouts** page
2. Click "New Workout"
3. Fill in:
   - Workout Type (e.g., Running)
   - Duration (e.g., 30 minutes)
   - Distance (optional)
   - Add notes (optional)
4. Click "Log Workout"
5. See your progress on the Dashboard!

### 4.4 Create a Goal
1. Go to **Goals** page
2. Click "New Goal"
3. Fill in goal details:
   - Goal Title (e.g., "Run 50 miles")
   - Category (Distance, Duration, Calories)
   - Target (e.g., 50)
   - Unit (miles, kilometers, minutes, etc.)
   - Deadline (optional)
4. Click "Create Goal"
5. Update progress and watch it fill up!

### 4.5 Join a Challenge
1. Go to **Challenges** page
2. Browse available challenges
3. Click "Join Challenge" to participate
4. Watch your progress on challenge leaderboard

## Step 5: Configure Social Login (Optional)

### For Google Login:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:5173` to authorized redirect URIs
6. Copy the Client ID
7. In Supabase, go to Authentication → Providers → Google
8. Paste your Google Client ID
9. Save

### For Facebook Login:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Set up Facebook Login product
4. Add `http://localhost:5173` to Authorized Redirect URIs
5. Get your App ID and App Secret
6. In Supabase, go to Authentication → Providers → Facebook
7. Paste your credentials
8. Save

## Step 6: Production Deployment (Optional)

### Deploy Frontend to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Deploy Backend (Optional)
If using the Node.js backend:
1. Go to [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set environment variables
5. Deploy

## Common Issues & Solutions

### Issue: "VITE_SUPABASE_URL is not defined"
**Solution**: 
1. Make sure your `.env.local` file exists in the `FrontEnd` directory
2. Restart your dev server: `npm run dev`
3. Check that the file is in the correct location (FrontEnd/.env.local)

### Issue: "Profile picture not uploading"
**Solution**:
1. Make sure you created the `avatars` storage bucket in Supabase
2. Make sure the bucket is set to Public
3. Check that your file is under 5MB

### Issue: "Can't log in with Google/Facebook"
**Solution**:
1. Make sure you set up the OAuth provider correctly in Supabase
2. Make sure the redirect URIs match exactly
3. For local development, use `http://localhost:5173`
4. For production, use your domain

### Issue: "Database tables not created"
**Solution**:
1. Go to SQL Editor in Supabase
2. Check that all tables exist under "Tables" section
3. If not, copy the SQL from `SUPABASE_SCHEMA.sql` and run it again
4. Make sure there are no SQL errors

### Issue: "Styling looks broken"
**Solution**:
1. Make sure Tailwind CSS is installed: `npm install tailwindcss`
2. Restart your dev server
3. Clear browser cache (Ctrl+Shift+Delete)

## Project Structure

```
FitnessBuddyApp/
├── FrontEnd/
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── CircularProgress.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── AnimatedBackground.jsx
│   │   │   └── AuthBackground.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Workouts.jsx
│   │   │   ├── Buddies.jsx
│   │   │   ├── Challenges.jsx
│   │   │   ├── Achievements.jsx
│   │   │   ├── GymFinder.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Resources.jsx
│   │   │   └── Chat.jsx
│   │   ├── context/         # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useCounter.js
│   │   ├── lib/             # Utilities
│   │   │   └── supabase.js
│   │   └── utils/
│   │       └── MatchUsers.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── package.json
│   └── .env.local           # Your environment variables
├── BackEnd/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── config/
├── SUPABASE_SCHEMA.sql      # Database schema
├── SETUP_GUIDE.md           # This file
└── README.md
```

## Features to Explore

1. **🏃 Dashboard** - Overview of your fitness journey
2. **👤 Profile** - Set up your fitness profile
3. **🎯 Goals** - Create and track fitness goals
4. **💪 Workouts** - Log and track workouts
5. **🤝 Buddies** - Connect with fitness friends
6. **🎯 Challenges** - Join community challenges
7. **🏆 Leaderboard** - See rankings
8. **🏅 Achievements** - Earn badges and rewards
9. **🏢 Gym Finder** - Find nearby fitness venues
10. **📚 Resources** - Access fitness content
11. **💬 Chat** - Message with buddies

## Next Steps

1. **Customize the App**:
   - Change colors in `tailwind.config.js`
   - Modify theme in `src/context/ThemeContext.jsx`
   - Add your own logo and branding

2. **Add More Features**:
   - Implement workout groups
   - Add payment integration for premium features
   - Integrate with fitness trackers (Fitbit, Apple Watch, etc.)
   - Add meal planning features

3. **Optimize Performance**:
   - Code splitting
   - Image optimization
   - Lazy loading components
   - Caching strategies

4. **Improve Security**:
   - Implement CORS properly
   - Rate limiting
   - Input validation
   - Regular security audits

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite Docs**: https://vitejs.dev
- **Framer Motion**: https://www.framer.com/motion/

## Troubleshooting

If you encounter issues:

1. **Check the browser console** for error messages
2. **Check Supabase logs** in the dashboard
3. **Review environment variables** are set correctly
4. **Clear browser cache** and restart dev server
5. **Check network tab** in browser DevTools for failed requests

## Contributing

Found a bug? Want to add a feature? Create a Pull Request!

## License

This project is open source under the MIT License.

---

**You're all set! 🎉 Start using Fitness Buddy to reach your fitness goals!**

Happy coding! 💪🚀
