# Fitness Buddy - Frontend

A modern, feature-rich fitness social platform built with React 18, Vite, and Tailwind CSS. Connect with fitness enthusiasts, track workouts, join challenges, and achieve your health goals together.

## 🌟 Features

### Core Features
- **User Authentication**: Sign up, login, and password recovery via Supabase Auth
- **Profile Management**: Create and customize your fitness profile with avatar upload
- **Workout Tracking**: Log workouts with duration, distance, and calorie calculations
- **Goal Management**: Set and track personal fitness goals with progress visualization
- **Challenges**: Join community challenges, track progress, and earn badges
- **Leaderboard**: Compete with other users individually or in groups
- **Buddy System**: Find and connect with fitness partners based on compatibility matching
- **Real-time Chat**: Instant messaging with connected fitness buddies
- **Gym Finder**: Discover nearby fitness venues with details and save favorites
- **Achievements**: Earn badges for milestones and accomplishments

### UI/UX Features
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Spring-based animations using Framer Motion
- **Interactive Backgrounds**: Particle effects and gradient animations
- **Page Transitions**: Smooth navigation between pages with animations
- **Collapsible Sidebar**: Easy navigation with active link highlighting
- **Real-time Notifications**: Alerts for group joins, connections, and messages

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.2.0
- **Styling**: Tailwind CSS 3.4.1 with custom colors
- **Animations**: Framer Motion 10.16.4
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT tokens
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts for progress visualization
- **Effects**: React Confetti for celebrations
- **Routing**: React Router DOM v6


## 🚀 Installation

1. **Clone the repository**
   ```bash
   cd FrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file** with Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── AnimatedBackground.jsx    # Multi-layer background effects
│   ├── AuthBackground.jsx        # Login page background
│   ├── CircularProgress.jsx       # Progress visualization
│   ├── Layout.jsx               # Main app layout with sidebar
│   ├── PageTransition.jsx        # Page entrance animations
│   ├── ProgressBar.jsx          # Linear progress component
│   └── ProtectedRoute.jsx        # Auth-protected routes
├── context/             # React Context for global state
│   ├── AuthContext.jsx         # Authentication state & methods
│   └── ThemeContext.jsx        # Dark mode state
├── hooks/              # Custom React hooks
│   └── useCounter.js           # Counter hook utility
├── lib/                # Supabase & external services
│   └── supabase.js             # Supabase client initialization
├── pages/              # Page components (11 total)
│   ├── Dashboard.jsx            # Home page with quick links
│   ├── Profile.jsx              # User profile & avatar upload
│   ├── Goals.jsx                # Fitness goal management
│   ├── Workouts.jsx             # Workout logging & history
│   ├── Buddies.jsx              # Buddy matching & discovery
│   ├── Challenges.jsx           # Community challenges
│   ├── Achievements.jsx         # Badges & milestones
│   ├── GymFinder.jsx            # Gym discovery & saves
│   ├── Leaderboard.jsx          # Rankings & group management
│   ├── Chat.jsx                 # Buddy messaging
│   ├── Resources.jsx            # Fitness tips & resources
│   └── Login.jsx                # Auth (signup/login/forgot password)
├── utils/              # Utility functions
│   └── MatchUsers.js           # Buddy matching algorithm
├── App.jsx             # Main app component
├── App.css             # Global styles
├── main.jsx            # React DOM entry point
└── index.css            # Base Tailwind styles
```

## 🔐 Authentication

### Sign Up Flow
1. Enter email and password
2. Account created via Supabase Auth
3. Optional email confirmation (if enabled in Supabase)
4. Redirected to dashboard after login

### Login Options
- Email/Password authentication
- Google OAuth
- Facebook OAuth
- Forgot Password with email recovery

### Protected Routes
All pages except Login are protected via `ProtectedRoute` component that checks authentication status.

## 📊 Pages Overview

### Dashboard
- Quick action buttons to navigate key features
- Fitness statistics summary
- Recent workouts preview
- Call-to-action for profile completion

### Profile
- Edit personal information (age, location, goal, etc.)
- Avatar upload to Supabase Storage
- Profile completion status
- Success/error notifications

### Goals
- Create new fitness goals
- Track progress toward targets
- Visual progress bars
- Goal history and completion

### Workouts
- Log new workouts with type, duration, distance
- Auto-calculate calories burned
- View workout history
- Weekly summary statistics
- Celebrate weekly goal achievements

### Buddies
- View recommended fitness buddies with match scores
- Connect with other users
- View all connected buddies
- Start conversations with buddies
- Profile information and preferences

### Challenges
- Browse available challenges
- Join challenges to compete
- Track personal progress
- Earn reward badges
- Challenge creation (for users)

### GymFinder
- Search and filter gyms by type
- View gym details (address, phone, hours, amenities)
- Get directions via Google Maps
- Save favorite gyms
- Unsave gyms from favorites

### Leaderboard
- Individual rankings by points
- Group leaderboards
- Join fitness groups with alerts
- Track personal rank and stats compared to others

### Chat
- See all connected buddies list
- Send/receive real-time messages
- Message history with timestamps
- Responsive chat interface

### Achievements
- View earned badges and milestones
- Celebrate accomplishments
- Track achievement progress

## 🔄 State Management

### AuthContext
```javascript
{
  user,                  // Current user object
  loading,               // Auth loading state
  signIn(email, password),
  signUp(email, password),
  signOut(),
  resetPassword(email),
  signInWithGoogle(),
  signInWithFacebook()
}
```

### ThemeContext
```javascript
{
  dark,              // Current theme
  setDark(boolean)   // Toggle theme
}
```

## 📡 Supabase Integration

### Database Tables
- `profiles` - User profile information
- `workouts` - Logged workout data
- `challenges` - Challenge definitions
- `challenge_members` - User challenge participation
- `buddies` - User connections
- `chat_messages` - Direct messages between buddies
- `saved_gyms` - User's favorite gyms
- `achievements` - User badges and milestones
- `fitness_goals` - User goals
- `workout_groups` - Group challenges

### Row-Level Security (RLS)
All tables have RLS policies enabled to ensure:
- Users can only view/edit their own data
- Profiles are visible to authenticated users
- Messages are only accessible to sender/receiver

### Storage
- `avatars/` bucket for user profile pictures
- Public read access for profile image loading
- Naming convention: `{user_id}.{ext}`

## 🎯 Key Integrations

### Buddy Matching Algorithm
Located in `src/utils/MatchUsers.js`
- Calculates match scores based on:
  - Fitness goals similarity
  - Workout preferences
  - Location proximity
  - Weekly goal alignment

### Google Places API (GymFinder)
- Backend integration via Express server
- Fetches nearby fitness venues
- Supports filtering by venue type

### Real-time Chat
- Uses Supabase real-time subscriptions
- Listens for new messages via PostgreSQL changes
- Automatic message history loading

## 🎨 Styling

### Tailwind CSS Custom Config
```javascript
colors: {
  primary: '#0F2A1D',
  secondary: '#6B9071',
  darkGreen: '#375534',
  accent: '#AEC3B0',
  light: '#E3EED4',
}
```

### Component Classes
- Gradient text: `text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary`
- Gradient buttons: `bg-gradient-to-r from-primary to-secondary`
- Dark mode: `dark:bg-gray-900 dark:text-white`

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Outputs optimized files to `dist/` directory.

### Deploy to Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Automatic deployment on push

### Deploy to Other Platforms
- Netlify: Connect GitHub repo, set build command: `npm run build`
- Firebase Hosting: `firebase deploy`
- AWS Amplify: Connect GitHub repo

## 🔧 Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: API Endpoints
VITE_API_URL=http://localhost:3001  # Backend server URL
```

## 📱 Responsive Design

- **Mobile (< 768px)**: Single column, collapsible sidebar
- **Tablet (768px - 1024px)**: Two columns, visible sidebar toggle
- **Desktop (> 1024px)**: Three columns, expanded sidebar, full layout

## 🎭 Animations

- **Page Transitions**: 500ms spring animation (stiffness: 100, damping: 20)
- **Sidebar Toggle**: 300ms ease animation
- **Button Hovers**: Scale 1.05 with spring physics
- **Background Effects**: 15-20s loop animations
- **Particle System**: 10 continuous particles with staggered timing
- **Message Bubbles**: 0.3s scale-in animation

## ⚙️ Build Scripts

```bash
# Development
npm run dev          # Start Vite dev server

# Production Build
npm run build        # Build optimized bundle
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
```

## 🐛 Debugging

### Enable Console Logs
Edit `src/lib/supabase.js`:
```javascript
const supabase = createClient(url, key, {
  auth: { persistSession: true },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by XHR to see Supabase API calls
3. Check Response tab for errors

### Authentication Issues
- Clear browser cache: Cmd/Ctrl + Shift + Delete
- Check localStorage for auth tokens
- Verify Supabase URL and key are correct

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Live Link
[Deploy your project here]

## 👤 Support

For issues and questions:
1. Check existing issues on GitHub
2. Create detailed bug reports with screenshots
3. Include browser/device information
4. Provide steps to reproduce

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com)
