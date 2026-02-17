# Fitness Buddy App 🏋️‍♂️

A modern, interactive fitness social platform built with React, Vite, Tailwind CSS, and Supabase that helps users set fitness goals, track progress, connect with workout buddies, and stay motivated in a supportive community.

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Registration & Login** with email verification
- **Social Login** - Google, Facebook (with Instagram coming soon)
- **Forgot Password & Reset** functionality
- **Secure Session Management** via Supabase Auth

### 👤 User Profiles
- **Customizable Profiles** with username, age, location
- **Profile Picture Upload** to cloud storage
- **Fitness Goals & Preferences** (e.g., weight loss, strength training)
- **Preferred Workout Types** (running, yoga, gym, cycling, swimming, HIIT, CrossFit, etc.)
- **Geolocation Integration** for buddy matching and gym discovery
- **Weekly Fitness Goals** setup (e.g., 150 minutes per week)

### 🎯 Goals Management
- **Create Custom Fitness Goals** with target metrics and deadlines
- **Track Progress** with real-time updates
- **Goal Categories** - Distance, Duration, Calories, Workouts
- **Visual Progress Bars** showing completion percentage
- **Celebratory Animations** 🎉 when goals are achieved
- **Goal Milestones** and reminders

### 💪 Workout Tracking
- **Log Workouts** - Type, duration, distance, estimated calories
- **Smart Calorie Calculation** based on activity type
- **Detailed Notes** for each workout
- **Weekly & All-Time Statistics** dashboard
- **Workout History** with filtering and sorting
- **Progress Analytics** with visual charts

### 📊 Dashboard & Analytics
- **At-a-Glance Overview** of fitness journey
- **Weekly Summary** - workouts completed, calories burned, time logged
- **Streak Display** - current consecutive days active
- **Motivational Messages** that change daily
- **Quick Access Links** to all features
- **Recent Workouts** preview
- **Goal Progress Visualization**

### 🤝 Social Features
- **Buddy Matching System** based on:
  - Fitness goals similarity
  - Preferred workout types
  - Geographic proximity
- **Connect with Similar Users** instantly
- **Messaging System** to communicate with buddies
- **Progress Sharing** with buddies
- **Buddy Activity Feed** to stay motivated

### 🎯 Challenges System
- **Community Challenges** - Run 50 miles, HIIT 100 workouts, etc.
- **Create Custom Challenges** to invite friends or go public
- **Challenge Leaderboards** with real-time rankings
- **Exclusive Badges** for completing challenges:
  - 🥇 Champion
  - 🦸 Hero
  - 👑 Legend
  - ⚔️ Warrior
  - 🔥 Phoenix
- **Challenge Difficulty Levels** and durations
- **Group Participation** and collective progress tracking
- **Rewards & Recognition** for achievements

### 🏆 Leaderboard & Ranking
- **Global Leaderboard** - Ranked by fitness points
- **Points System**:
  - 10 points per workout
  - 1 point per minute exercised
  - 0.1 points per calorie burned
- **Personal Rank Display** with medal indicators
- **Group Leaderboards** for competitive fun
- **Real-Time Rankings** updated instantly
- **Top Performers Recognition** 🥇🥈🥉

### 🏅 Achievements & Badges System
- **10+ Unlockable Badges** including:
  - First Step (first workout)
  - Week Warrior (7 workouts/week)
  - Goal Crusher (complete goal)
  - Social Butterfly (connect with buddies)
  - Champion (win challenge)
  - Streak Master (30-day streak)
  - Calorie Blaster (5K calories/month)
  - Elite Athlete (top 10 rank)
  - Sharing Superstar (share progress)
  - Explorer (save gyms)
- **Rarity Levels** - Common, Rare, Epic, Legendary, Mythic
- **Achievement Points** earned for unlocking badges
- **Progress Tracker** showing completion percentage

### 📱 Social Media Integration
- **Share Progress** on multiple platforms:
  - 🐦 Twitter/X
  - 📘 Facebook
  - 📷 Instagram
  - 💼 LinkedIn
- **Custom Share Messages** with emojis and stats
- **One-Click Sharing** from workouts/achievements
- **Social Media Buttons** throughout the app

### 🏢 Gym & Venue Finder
- **Location-Based Gym Discovery** near user
- **Filter by Type**:
  - Gyms
  - Yoga Studios
  - Running Tracks
  - CrossFit Boxes
  - Cycling Studios
  - Swimming Pools
- **Venue Details**:
  - Address and phone number
  - Operating hours
  - Amenities list
  - User ratings
  - Distance information
- **Save Favorite Gyms** to profile
- **Google Maps Integration** for directions
- **Coordinate Gym Sessions** with buddies

### 👥 Workout Groups
- **Create or Join Groups** based on fitness interests
- **Group Progress Tracking** with collective goals
- **Team Leaderboards** within groups
- **Group Challenges** for friendly competition
- **Member Activity Timeline**
- **Group Statistics** and milestones
- **Real-Time Group Updates**

### 📚 Resources & Learning
- **Curated Workout Videos** library
- **Fitness Articles & Tips**
- **Exercise Guides** for different fitness levels
- **Nutrition Information**
- **Training Programs** for specific goals
- **Expert Tips & Advice**

### 💬 Messaging System
- **Real-Time Chat** with fitness buddies
- **Direct Messages** between users
- **Sharing Workout Plans** via chat
- **Motivational Messages** and support
- **Message History**
- **Online Status Indicators**

### 🎨 User Interface & Design
- **Modern, Clean Design** with professional aesthetics
- **Dark Mode Support** for comfortable viewing
- **Smooth Animations** using Framer Motion
- **Responsive Design** - desktop, tablet, mobile
- **Intuitive Navigation** with sidebar menu
- **Beautiful Gradients** and color schemes
- **Icons & Emojis** for visual clarity
- **Loading States** and transitions

### 🎉 Celebratory Features
- **Confetti Animations** when reaching milestones
- **Goal Achievement Celebrations** with encouragement
- **Streak Notifications** and encouragement
- **Challenge Completion Celebrations**
- **Achievement Unlock Effects**

### 📈 Progress Analytics
- **Weekly Summary Reports**
- **All-Time Statistics**
- **Calorie Tracking**
- **Duration Analytics**
- **Workout Frequency Charts**
- **Goal Progress Visualization**

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing
- **Recharts** - Data visualization (optional)

### Backend & Database
- **Supabase** - PostgreSQL database
- **Supabase Auth** - Authentication
- **Supabase Storage** - File uploads
- **Supabase Realtime** - Live updates

### Dependencies
- `@supabase/supabase-js` - Supabase client
- `framer-motion` - Animations
- `react-confetti` - Celebration effects
- `lucide-react` - Icons
- `react-router-dom` - Routing

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm/yarn
- Supabase account (free tier available)
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fitnesbuddy-app.git
cd FitnessBuddyApp
```

2. **Install dependencies**
```bash
# Frontend
cd FrontEnd
npm install

# Backend (if using)
cd ../BackEnd
npm install
```

3. **Set up environment variables**

Create `.env` file in the FrontEnd directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**
```bash
cd FrontEnd
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
FitnessBuddyApp/
├── FrontEnd/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
├── BackEnd/
│   ├── controllers/         # Route controllers
│   ├── config/              # Configuration files
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## 📋 Database Schema

### Tables Created in Supabase:
- `profiles` - User profile information
- `workouts` - Workout log entries
- `fitness_goals` - User fitness goals
- `challenges` - Community challenges
- `challenge_members` - Challenge participation tracking
- `buddies` - User buddy connections
- `saved_gyms` - Favorite gyms list
- `achievements` - User achievement tracking
- `chat_messages` - Direct messages between users

## 🔑 Key Features Explained

### Goal Progress Bars
Visual percentage bars show progress toward fitness goals with color-coded status:
- Red (0-33%) - Getting started
- Yellow (33-66%) - Making progress
- Green (66-100%) - Almost there!

### Points System
Users earn points for all fitness activities:
- Logging workouts
- Maintaining streaks
- Completing goals
- Winning challenges
- Earning achievements

### Buddy Matching Algorithm
Connects users based on:
1. **Goal Similarity** (weight loss, strength, etc.)
2. **Workout Preferences** (yoga, running, gym, etc.)
3. **Geographic Proximity** (within 10km radius)
4. **Activity Level** (frequency of workouts)

## 🎯 Future Enhancements
- [ ] Wearable device integration (Apple Watch, Fitbit)
- [ ] AI-powered workout recommendations
- [ ] Video chat for virtual training sessions
- [ ] Integration with popular fitness apps (Strava, MyFitnessPal)
- [ ] Advanced analytics and ML-based insights
- [ ] In-app payment system for premium features
- [ ] Push notifications and reminders
- [ ] Calendar view of workout history
- [ ] Meal planning and nutrition integration
- [ ] Voice-based workout logging

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open source and available under the MIT License.

## 👨‍💻 Support
For support, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments
- Built with ❤️ for the fitness community
- Thanks to Supabase for amazing backend services
- Icons by Lucide React
- Animations powered by Framer Motion

---

## 📚 Quick Start Guide

### For Users:
1. **Sign Up** via email or social login
2. **Create Profile** with fitness goals and preferences
3. **Set Weekly Goal** (e.g., 150 minutes of exercise)
4. **Browse Buddies** and connect with similar users
5. **Start Logging Workouts** to track progress
6. **Join Challenges** for extra motivation
7. **Share Progress** on social media
8. **Climb the Leaderboard** and earn badges!

### For Developers:
1. Set up Supabase project
2. Configure environment variables
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server
5. Explore the codebase and start customizing!

---

**Happy Fitness Journey! 🚀💪**
