import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Confetti from "react-confetti"
import CircularProgress from "../components/CircularProgress"
import PageTransition from "../components/PageTransition"
import useCounter from "../hooks/useCounter"
import { Zap, Trophy, Users, Target, TrendingUp, Calendar, Flame, Clock } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [weeklyGoal, setWeeklyGoal] = useState(0)
  const [weeklyStats, setWeeklyStats] = useState({ workouts: 0, calories: 0, minutes: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      const { data: workouts } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setProfile(profileData)
      setWeeklyGoal(profileData?.weekly_goal || 0)

      if (workouts) {
        // Total stats
        const total = workouts.reduce((acc, w) => acc + (w.duration || 0), 0)
        setTotalMinutes(total)
        setRecentWorkouts(workouts.slice(0, 3))

        // Weekly stats
        const last7Days = workouts.filter(w => {
          const workoutDate = new Date(w.created_at)
          const now = new Date()
          const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
          return diff <= 7
        })

        const weeklyMinutes = last7Days.reduce((acc, w) => acc + (w.duration || 0), 0)
        const weeklyCalories = last7Days.reduce((acc, w) => acc + (w.calories || 0), 0)

        setWeeklyStats({
          workouts: last7Days.length,
          minutes: weeklyMinutes,
          calories: weeklyCalories
        })

        // Calculate streak
        let currentStreak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          const hasWorkout = workouts.some(w => {
            const wDate = new Date(w.created_at)
            return wDate.toDateString() === date.toDateString()
          })
          if (hasWorkout) {
            currentStreak++
          } else if (i > 0) {
            break
          }
        }
        setStreak(currentStreak)
      }
    }

    fetchData()
  }, [user])

  const progress =
    weeklyGoal > 0
      ? Math.min((weeklyStats.minutes / weeklyGoal) * 100, 100)
      : 0

  const animatedMinutes = useCounter(totalMinutes)
  const animatedWeekly = useCounter(weeklyStats.minutes)
  const animatedCalories = useCounter(weeklyStats.calories)

  const motivationalMessages = [
    "You're crushing it! Keep up the momentum! 💪",
    "Every workout brings you closer to your goals! 🎯",
    "You're stronger than yesterday! 🌟",
    "Your dedication is inspiring! 🔥",
    "Great progress! Keep going! 🚀",
    "You've got this! 💪",
    "Stay focused and keep moving! 🏃"
  ]

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  const quickLinks = [
    { icon: "🎯", label: "Goals", path: "/goals", color: "from-primary to-secondary" },
    { icon: "💪", label: "Workouts", path: "/workouts", color: "from-secondary to-darkGreen" },
    { icon: "🤝", label: "Buddies", path: "/buddies", color: "from-accent to-light" },
    { icon: "🎯", label: "Challenges", path: "/challenges", color: "from-primary to-accent" },
    { icon: "🏆", label: "Leaderboard", path: "/leaderboard", color: "from-darkGreen to-secondary" },
    { icon: "🏢", label: "Gym Finder", path: "/gym-finder", color: "from-secondary to-primary" }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
        {progress >= 100 && <Confetti recycle={false} numberOfPieces={200} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header with Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            {profile?.avatar_url && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                src={profile.avatar_url}
                className="w-20 h-20 rounded-full shadow-lg border-4 border-primary"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                Welcome, {profile?.username || "Champion"} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold italic">
                "{randomMessage}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Streak and Stats Badges */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#375534] dark:to-[#6B9071] p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Current Streak</p>
                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{streak}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">days</p>
              </div>
              <span className="text-4xl">🔥</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#375534] dark:to-[#6B9071] p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">This Week</p>
                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{weeklyStats.workouts}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">workouts</p>
              </div>
              <span className="text-4xl">💪</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#375534] dark:to-[#6B9071] p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Total Minutes</p>
                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{animatedWeekly}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">this week</p>
              </div>
              <span className="text-4xl">⏱️</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#375534] dark:to-[#6B9071] p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Calories Burned</p>
                <p className="text-3xl font-bold text-[#0F2A1D] dark:text-[#E3EED4]">{animatedCalories}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">this week</p>
              </div>
              <span className="text-4xl">🔥</span>
            </div>
          </motion.div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Weekly Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Weekly Goal Progress
            </h2>
            <div className="flex flex-col items-center mb-4">
              <CircularProgress value={progress} />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {weeklyStats.minutes} / {weeklyGoal} minutes
            </p>
            {progress >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 p-3 bg-[#AEC3B0] dark:bg-[#6B9071] text-[#0F2A1D] dark:text-[#E3EED4] text-center rounded-lg font-bold text-sm"
              >
                🏆 Goal Achieved!
              </motion.div>
            )}
          </motion.div>

          {/* Total Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              All-Time Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Minutes</span>
                <span className="text-2xl font-bold text-primary dark:text-accent">{animatedMinutes}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Workouts</span>
                <span className="text-2xl font-bold text-secondary dark:text-darkGreen">
                  {recentWorkouts.length > 0 ? "Many" : "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Goal</span>
                <span className="text-2xl font-bold text-accent dark:text-[#AEC3B0]">{profile?.goal || "N/A"}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                to="/workouts"
              className="block w-full p-3 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
            >
              + Log Workout
            </Link>
              <Link
                to="/goals"
                className="block w-full p-3 bg-gradient-to-r from-accent to-darkGreen text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                View Goals
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`bg-gradient-to-br ${link.color} p-4 rounded-2xl shadow-lg hover:shadow-xl transition text-center text-white cursor-pointer`}>
                  <div className="text-3xl mb-2">{link.icon}</div>
                  <p className="font-bold text-sm">{link.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Workouts
            </h2>
            <div className="space-y-3">
              {recentWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{workout.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(workout.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
              <p className="font-bold text-primary dark:text-accent">{workout.duration} min</p>
                    <p className="text-sm text-secondary dark:text-darkGreen">{workout.calories} cal</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link
              to="/workouts"
              className="mt-4 block text-center py-2 text-primary dark:text-accent font-bold hover:underline"
            >
              View All Workouts →
            </Link>
          </motion.div>
        )}
      </motion.div>
      </div>
    </PageTransition>
  )
}
