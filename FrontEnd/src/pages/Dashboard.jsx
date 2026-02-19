import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import Confetti from "react-confetti"
import CircularProgress from "../components/CircularProgress"
import PageTransition from "../components/PageTransition"
import useCounter from "../hooks/useCounter"
import { Zap, Trophy, Users, Target, TrendingUp, Calendar, Flame, Clock, Dumbbell, MapPin, Gamepad2, Bell } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [goals, setGoals] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({ workouts: 0, calories: 0, minutes: 0 })
  const [dailyStats, setDailyStats] = useState({ workouts: 0, calories: 0, minutes: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [streak, setStreak] = useState(0)
  const [reminders, setReminders] = useState([])
  const [reminderTime, setReminderTime] = useState("08:00")
  const [reminderFrequency, setReminderFrequency] = useState("daily")

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

      const { data: goalsData } = await supabase
        .from("fitness_goals")
        .select("*")
        .eq("user_id", user.id)

      setProfile(profileData)
      setGoals(goalsData || [])

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

        // Daily stats (today only)
        const today = new Date()
        const todaysWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.created_at)
          return workoutDate.toDateString() === today.toDateString()
        })

        const dailyMinutes = todaysWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0)
        const dailyCalories = todaysWorkouts.reduce((acc, w) => acc + (w.calories || 0), 0)

        setDailyStats({
          workouts: todaysWorkouts.length,
          minutes: dailyMinutes,
          calories: dailyCalories
        })

        // Calculate streak
        let currentStreak = 0
        const currentDate = new Date()
        for (let i = 0; i < 365; i++) {
          const date = new Date(currentDate)
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

    // Load reminders from localStorage
    const savedReminders = localStorage.getItem(`reminders_${user.id}`)
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [user])

  const handleAddReminder = () => {
    if (reminderTime) {
      const newReminder = {
        id: Date.now(),
        time: reminderTime,
        frequency: reminderFrequency,
        createdAt: new Date()
      }
      const updatedReminders = [...reminders, newReminder]
      setReminders(updatedReminders)
      localStorage.setItem(`reminders_${user.id}`, JSON.stringify(updatedReminders))
      alert(`✅ Reminder set for ${reminderTime}`)
      setReminderTime("08:00")
    }
  }

  const handleDeleteReminder = (id) => {
    const updatedReminders = reminders.filter(r => r.id !== id)
    setReminders(updatedReminders)
    localStorage.setItem(`reminders_${user.id}`, JSON.stringify(updatedReminders))
  }

  const animatedMinutes = useCounter(totalMinutes)
  const animatedWeekly = useCounter(weeklyStats.minutes)
  const animatedCalories = useCounter(weeklyStats.calories)
  const animatedDailyCalories = useCounter(dailyStats.calories)
  const animatedDailyMinutes = useCounter(dailyStats.minutes)

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
    { icon: Target, label: "Goals", path: "/goals", color: "from-primary to-secondary" },
    { icon: Dumbbell, label: "Workouts", path: "/workouts", color: "from-secondary to-darkGreen" },
    { icon: Users, label: "Buddies", path: "/buddies", color: "from-accent to-light" },
    { icon: Gamepad2, label: "Challenges", path: "/challenges", color: "from-primary to-accent" },
    { icon: TrendingUp, label: "Leaderboard", path: "/leaderboard", color: "from-darkGreen to-secondary" },
    { icon: MapPin, label: "Gym Finder", path: "/gym-finder", color: "from-secondary to-primary" }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6 relative overflow-hidden">
        {/* Animated Wave Background SVG */}
        <svg
          className="absolute top-0 left-0 w-full h-64 opacity-20 dark:opacity-10"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          style={{ zIndex: 0 }}
        >
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z"
            fill="url(#gradient)"
            animate={{
              d: [
                "M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z",
                "M0,120 Q250,30 500,120 T1000,120 L1000,200 L0,200 Z",
                "M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#0F2A1D", stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: "#6B9071", stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
        </svg>
        {streak >= 7 && <Confetti recycle={false} numberOfPieces={100} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto relative z-10"
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
          {/* Daily Activity Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Activity
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Spent
                </span>
                <span className="text-2xl font-bold text-primary dark:text-accent">{animatedDailyMinutes}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Calories Burned
                </span>
                <span className="text-2xl font-bold text-secondary dark:text-darkGreen">{animatedDailyCalories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Workouts Done
                </span>
                <span className="text-2xl font-bold text-accent dark:text-[#AEC3B0]">{dailyStats.workouts}</span>
              </div>
            </div>
          </motion.div>

          {/* BMI & Weight Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              ⚖️ BMI Progress
            </h2>
            {profile && profile.weight && profile.height ? (
              <div className="space-y-4">
                {(() => {
                  const heightInMeters = profile.height / 100
                  const currentBmi = profile.weight / (heightInMeters * heightInMeters)
                  const bmiCategory = currentBmi < 18.5 ? "Underweight" : currentBmi < 25 ? "Normal" : currentBmi < 30 ? "Overweight" : "Obese"
                  
                  const colorClasses = {
                    Underweight: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-700", text: "text-blue-600 dark:text-blue-400" },
                    Normal: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-700", text: "text-green-600 dark:text-green-400" },
                    Overweight: { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700", text: "text-orange-600 dark:text-orange-400" },
                    Obese: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-700", text: "text-red-600 dark:text-red-400" }
                  }
                  
                  const colors = colorClasses[bmiCategory]
                  
                  return (
                    <>
                      <div className={`p-4 ${colors.bg} rounded-lg border-2 ${colors.border}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current BMI</p>
                        <p className={`text-3xl font-bold ${colors.text}`}>{currentBmi.toFixed(1)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{bmiCategory}</p>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Current Weight</span>
                        <span className="font-bold text-gray-900 dark:text-white">{profile.weight?.toFixed(1)} kg</span>
                      </div>
                      {profile.target_weight && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Target Weight</span>
                          <span className="font-bold text-primary dark:text-accent">{profile.target_weight?.toFixed(1)} kg</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-600 dark:text-gray-400 text-sm">
                Update your weight and height in Profile to see BMI progress
              </div>
            )}
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
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate("/workouts")}
                className="w-full p-3 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                + Log Workout
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate("/goals")}
                className="w-full p-3 bg-gradient-to-r from-secondary to-darkGreen text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                Set Goal
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => navigate("/buddies")}
                className="w-full p-3 bg-gradient-to-r from-accent to-primary text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                Find Buddies
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Reminders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Workout Reminders
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
              <select
                value={reminderFrequency}
                onChange={(e) => setReminderFrequency(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleAddReminder}
                className="w-full p-3 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition text-center"
              >
                Set Reminder
              </motion.button>
            </div>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Active Reminders:</p>
              {reminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{reminder.time}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{reminder.frequency}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

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
