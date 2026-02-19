import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import ProgressBar from "../components/ProgressBar"
import { Plus, Share2, Trash2, Flame, Clock, Zap, Facebook, Instagram, Linkedin, Edit2 } from "lucide-react"
import { checkWorkoutAchievements, checkProgressShareAchievements } from "../utils/achievementUtils"

export default function Workouts() {
  const { user } = useAuth()
  const [type, setType] = useState("")
  const [duration, setDuration] = useState("")
  const [distance, setDistance] = useState("")
  const [notes, setNotes] = useState("")
  const [workouts, setWorkouts] = useState([])
  const [weeklyGoal, setWeeklyGoal] = useState(0)
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [celebratingWeek, setCelebratingWeek] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [profile, setProfile] = useState(null)

  const caloriesPerMinute = 5

  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const { data: goalsData } = await supabase
      .from("fitness_goals")
      .select("*")
      .eq("user_id", user.id)

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (data) setWorkouts(data)
    if (goalsData) {
      setGoals(goalsData)
      // Get weekly goals and calculate total target
      const weeklyGoalsData = goalsData.filter(g => !g.deadline || new Date(g.deadline) > new Date())
      let totalWeeklyTarget = 0
      weeklyGoalsData.forEach(g => {
        if (g.unit === "minutes" || g.unit === "time" || g.category === "time") {
          totalWeeklyTarget += g.target || 0
        }
      })
      setWeeklyGoal(totalWeeklyTarget > 0 ? totalWeeklyTarget : 2.5 * 60) // Default 2.5 hours = 150 minutes
    }
    if (profileData) setProfile(profileData)
  }

  useEffect(() => {
    if (user) fetchWorkouts()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!type || !duration) {
      alert("Please fill in workout type and duration")
      return
    }

    // Check if distance is required for specific workout types
    const distanceRequiredTypes = ["Running", "Walking", "Cycling"]
    if (distanceRequiredTypes.includes(type) && !distance) {
      alert(`Distance is required for ${type} workouts!`)
      return
    }

    try {
      // Verify user profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase.from("profiles").insert([{
          id: user.id,
          email: user.email,
          username: user.email?.split("@")[0] || "user",
          created_at: new Date()
        }])

        if (createError) {
          alert("Error creating user profile: " + createError.message)
          return
        }
      }

      const calories = duration * caloriesPerMinute

      if (editingId) {
        // Update existing workout
        const { error } = await supabase
          .from("workouts")
          .update({
            type,
            duration: parseFloat(duration),
            distance: distance ? parseFloat(distance) : null,
            calories,
            notes,
            updated_at: new Date()
          })
          .eq("id", editingId)

        if (error) {
          alert("Error updating workout: " + error.message)
          return
        }

        setEditingId(null)
      } else {
        // Create new workout
        const { error } = await supabase.from("workouts").insert([
          {
            user_id: user.id,
            type,
            duration: parseFloat(duration),
            distance: distance ? parseFloat(distance) : null,
            calories,
            notes,
            created_at: new Date()
          }
        ])

        if (error) {
          alert("Error adding workout: " + error.message)
          return
        }
      }

      setType("")
      setDuration("")
      setDistance("")
      setNotes("")
      setShowForm(false)
      
      // Award achievements based on workout activity
      if (!editingId) {
        try {
          await checkWorkoutAchievements(user.id)
        } catch (error) {
          console.error("Error checking achievements:", error)
        }
      }
      
      fetchWorkouts()
      
      // Trigger achievements update IMMEDIATELY
      window.dispatchEvent(new Event('achievementsUpdate'))
      window.dispatchEvent(new Event('leaderboardUpdate'))
    } catch (error) {
      alert("Error: " + error.message)
    }
  }

  const handleEditWorkout = (workout) => {
    setType(workout.type)
    setDuration(workout.duration)
    setDistance(workout.distance || "")
    setNotes(workout.notes || "")
    setEditingId(workout.id)
    setShowForm(true)
  }

  const handleDeleteWorkout = async (id) => {
    if (confirm("Delete this workout?")) {
      try {
        // Immediately remove from local state for instant UI update
        setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== id))
        
        const { error } = await supabase.from("workouts").delete().eq("id", id)
        if (error) {
          alert("Error deleting workout: " + error.message)
          // Restore to local state if deletion fails
          fetchWorkouts()
          return
        }
        
        alert("✓ Workout deleted successfully!")
        // Refresh data and dispatch events immediately
        window.dispatchEvent(new Event('leaderboardUpdate'))
        window.dispatchEvent(new Event('achievementsUpdate'))
        fetchWorkouts()
      } catch (error) {
        alert("Error: " + error.message)
        fetchWorkouts()
      }
    }
  }

  const weeklySummary = () => {
    const last7Days = workouts.filter(w => {
      const workoutDate = new Date(w.created_at)
      const now = new Date()
      const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
      return diff <= 7
    })

    // Count unique days with activity instead of total hours
    const uniqueDays = new Set()
    last7Days.forEach(w => {
      const date = new Date(w.created_at).toDateString()
      uniqueDays.add(date)
    })

    const totalDuration = last7Days.reduce((acc, w) => acc + (w.duration || 0), 0)
    const totalCalories = last7Days.reduce((acc, w) => acc + (w.calories || 0), 0)
    const totalWorkouts = last7Days.length
    const activeDays = uniqueDays.size

    return { totalDuration, totalCalories, totalWorkouts, activeDays }
  }

  const summary = weeklySummary()
  // Progress based on daily activity: 7 active days = 100%
  const progressPercent = Math.min((summary.activeDays / 7) * 100, 100)

  const shareProgress = (platform) => {
    const text = `🔥 This week on Fitness Buddy:\n• ${summary.totalWorkouts} Workouts\n• ${summary.totalDuration} minutes\n• ${summary.totalCalories} calories burned\n\nJoin me in my fitness journey! 💪 #FitnessBuddy #FitnessGoals`

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=fitnesbuddy.com`,
      instagram: "https://www.instagram.com/" // Instagram requires mobile app or special handling
    }

    if (platform === "instagram") {
      alert("📷 Share this manually on Instagram:\n\n" + text)
    } else if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400")
    }
  }

  const handleShareWithBuddies = async () => {
    try {
      // Fetch connected buddies
      const { data: connectedBuddies } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "connected")

      if (!connectedBuddies || connectedBuddies.length === 0) {
        alert("🤝 You don't have any connected buddies yet!\n\nGo to Buddies section to connect with fitness friends.")
        return
      }

      // Prepare share data
      const shareStats = {
        workouts: summary.totalWorkouts,
        duration: summary.totalDuration,
        calories: summary.totalCalories,
        activeDays: summary.activeDays,
        progressPercent: Math.round(progressPercent)
      }

      // Share with all connected buddies
      const shares = connectedBuddies.map(buddy => ({
        sharer_id: user.id,
        receiver_id: buddy.buddy_id,
        share_type: 'weekly_summary',
        title: `${summary.totalWorkouts} workouts this week!`,
        message: `Just completed ${summary.totalWorkouts} workouts with ${summary.totalCalories} calories burned! 🔥`,
        stats: shareStats
      }))

      const { error } = await supabase.from("progress_shares").insert(shares)

      if (error) {
        console.error("Share error:", error)
        alert("Error sharing progress with buddies")
        return
      }

      alert(`✅ Progress shared with ${connectedBuddies.length} buddy(ies)! 🎉`)
      
      // Check for progress sharing achievements
      await checkProgressShareAchievements(user.id)
      
      // Dispatch achievement update event
      window.dispatchEvent(new Event('achievementsUpdate'))
    } catch (error) {
      console.error("Error sharing:", error)
      alert("Error: " + error.message)
    }
  }

  const handleShareWorkout = async (workout) => {
    try {
      // Fetch connected buddies
      const { data: connectedBuddies } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "connected")

      if (!connectedBuddies || connectedBuddies.length === 0) {
        alert("🤝 You don't have any connected buddies yet!\n\nGo to Buddies section to connect with fitness friends.")
        return
      }

      // Prepare share data
      const shareStats = {
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        distance: workout.distance
      }

      // Share with all connected buddies
      const shares = connectedBuddies.map(buddy => ({
        sharer_id: user.id,
        receiver_id: buddy.buddy_id,
        share_type: 'workout',
        workout_id: workout.id,
        title: `Just completed a ${workout.type} workout!`,
        message: `${workout.duration} min ${workout.type} session 💪 ${workout.calories} calories burned`,
        stats: shareStats
      }))

      const { error } = await supabase.from("progress_shares").insert(shares)

      if (error) {
        console.error("Share error:", error)
        alert("Error sharing workout with buddies")
        return
      }

      alert(`✅ Workout shared with ${connectedBuddies.length} buddy(ies)! 🎉`)
      
      // Check for progress sharing achievements
      await checkProgressShareAchievements(user.id)
      
      // Dispatch achievement update event
      window.dispatchEvent(new Event('achievementsUpdate'))
    } catch (error) {
      console.error("Error sharing:", error)
      alert("Error: " + error.message)
    }
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      {progressPercent >= 100 && <Confetti numberOfPieces={200} recycle={false} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 mb-2">
              💪 Workout Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Log your workouts and track your progress
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Workout
          </motion.button>
        </div>

        {/* Weekly Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 This Week's Summary
            </h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => shareProgress("facebook")}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                title="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => shareProgress("twitter")}
                className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                title="Share on Twitter"
              >
                <Zap className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => shareProgress("instagram")}
                className="p-3 bg-gradient-to-r from-primary to-secondary text-light rounded-lg hover:shadow-lg transition"
                title="Share on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => shareProgress("linkedin")}
                className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Weekly Activity Progress</span>
              <span className="text-lg font-bold text-primary dark:text-accent">
                {summary.activeDays} / 7 Days Active ({Math.round(progressPercent)}%)
              </span>
            </div>
            <ProgressBar percentage={progressPercent} />
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#6B9071] dark:to-[#375534] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary dark:text-accent" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Workouts</span>
              </div>
              <p className="text-3xl font-bold text-primary dark:text-accent">{summary.totalWorkouts}</p>
            </div>

            <div className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#6B9071] dark:to-[#375534] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-secondary dark:text-darkGreen" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Days</span>
              </div>
              <p className="text-3xl font-bold text-secondary dark:text-darkGreen">{summary.activeDays}/7</p>
            </div>

            <div className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#6B9071] dark:to-[#375534] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-accent dark:text-[#AEC3B0]" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Calories</span>
              </div>
              <p className="text-3xl font-bold text-accent dark:text-[#AEC3B0]">{summary.totalCalories}</p>
            </div>

            <div className={`bg-gradient-to-br ${progressPercent >= 100 ? "from-[#AEC3B0] to-[#E3EED4] dark:from-[#6B9071] dark:to-[#375534]" : "from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700"} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{progressPercent >= 100 ? "🏅" : "🎯"}</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {progressPercent >= 100 ? "Goal Reached!" : `${Math.round(100 - progressPercent)}% left`}
              </p>
            </div>
          </div>

          {progressPercent >= 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg text-center font-bold"
            >
              🏆 Amazing! You've reached your weekly goal! Keep it up!
            </motion.div>
          )}

          {/* Share with Buddies Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShareWithBuddies}
            className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share This Week's Progress with Buddies 🤝
          </motion.button>
        </motion.div>

        {/* Add Workout Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Workout" : "Log New Workout"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Workout Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  >
                    <option value="">Select workout type</option>
                    <option value="Running">Running</option>
                    <option value="Gym">Gym</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Swimming">Swimming</option>
                    <option value="HIIT">HIIT</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Dancing">Dancing</option>
                    <option value="Walking">Walking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Distance (optional) <span className="text-red-500">*{["Running", "Walking", "Cycling"].includes(type) ? " Required" : ""}</span></label>
                  <input
                    type="number"
                    placeholder={["Running", "Walking", "Cycling"].includes(type) ? "e.g., 5 (km/miles) - REQUIRED" : "e.g., 5 (km/miles)"}
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  />
                  {["Running", "Walking", "Cycling"].includes(type) && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">✓ Required for this workout type</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Estimated Calories</label>
                  <input
                    type="number"
                    value={duration ? duration * caloriesPerMinute : 0}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes</label>
                <textarea
                  placeholder="How did you feel? Any achievements?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  {editingId ? "Update Workout" : "Log Workout"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setType("")
                    setDuration("")
                    setDistance("")
                    setNotes("")
                  }}
                  className="flex-1 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* BMI & Weight Loss Tracking Section */}
        {profile && profile.weight && profile.height && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-500 mb-6">
              ⚖️ BMI & Weight Loss Progress
            </h2>
            
            {(() => {
              const heightInMeters = profile.height / 100
              const currentBmi = profile.weight / (heightInMeters * heightInMeters)
              const weightDifference = profile.weight - (profile.target_weight || profile.weight)
              const bmiDifference = currentBmi - (profile.target_bmi || currentBmi)
              
              // Calculate weight loss impact from workouts
              // Average: 500 calories = 0.058 kg weight loss (1 kg = ~7700 calories)
              const totalCaloriesBurned = summary.totalCalories
              const weightLossFromWorkouts = totalCaloriesBurned / 7700 * 0.9 // Conservative estimate
              
              // Estimate days to reach target
              let daysToTarget = "N/A"
              if (profile.target_weight && weightDifference > 0) {
                const avgDailyCalorieDeficit = summary.totalCalories > 0 ? (summary.totalCalories / summary.totalWorkouts) : 300
                const daysPerKg = 7700 / avgDailyCalorieDeficit
                daysToTarget = Math.ceil(weightDifference * daysPerKg) + " days"
              }
              
              const bmiCategory = currentBmi < 18.5 ? "Underweight" : currentBmi < 25 ? "Normal" : currentBmi < 30 ? "Overweight" : "Obese"
              
              // Color mapping for BMI categories
              const colorMap = {
                Underweight: { bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10", border: "border-blue-200 dark:border-blue-700", text: "text-blue-600 dark:text-blue-400" },
                Normal: { bg: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10", border: "border-emerald-200 dark:border-emerald-700", text: "text-emerald-600 dark:text-emerald-400" },
                Overweight: { bg: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10", border: "border-amber-200 dark:border-amber-700", text: "text-amber-600 dark:text-amber-400" },
                Obese: { bg: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10", border: "border-red-200 dark:border-red-700", text: "text-red-600 dark:text-red-400" }
              }
              const colors = colorMap[bmiCategory]
              
              return (
                <div className="space-y-6">
                  {/* Current BMI Card */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={`bg-gradient-to-br ${colors.bg} rounded-lg p-6 border-2 ${colors.border}`}>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Current BMI</p>
                      <p className={`text-4xl font-bold ${colors.text} mb-2`}>{currentBmi.toFixed(1)}</p>
                      <p className={`text-sm font-semibold ${colors.text}`}>{bmiCategory}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/10 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Weight Loss Impact</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{weightLossFromWorkouts.toFixed(2)} kg</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">From {totalCaloriesBurned} calories burned</p>
                    </div>
                  </div>
                  
                  {/* Weight Progress */}
                  {profile.target_weight && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-6 border-2 border-green-200 dark:border-green-700">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Target Weight Progress</p>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {profile.weight.toFixed(1)} / {profile.target_weight.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.max(0, Math.min(100, ((profile.weight - profile.target_weight) / (profile.weight - profile.target_weight) * 100)))}%`
                          }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        {weightDifference > 0 ? `${weightDifference.toFixed(1)} kg to lose` : "Target reached! 🎉"}
                      </p>
                    </div>
                  )}
                  
                  {/* Estimation */}
                  {profile.target_weight && weightDifference > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Projected Time to Target BMI</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {daysToTarget}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Based on your recent workout activity and calorie burn rate
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        )}

        {!profile?.weight || !profile?.height ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 border-2 border-blue-200 dark:border-blue-700"
          >
            <p className="text-blue-700 dark:text-blue-300 text-center">
              <strong>💡 Tip:</strong> Go to your <strong>Profile</strong> and add your weight & height to see BMI tracking and weight loss progress!
            </p>
          </motion.div>
        ) : null}

        {/* Workouts History */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📋 Workout History</h2>
          <div className="grid gap-4">
            {workouts.length > 0 ? (
              workouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {workout.type}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(workout.created_at).toLocaleDateString()} at{" "}
                        {new Date(workout.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditWorkout(workout)}
                        className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                        title="Edit workout"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShareWorkout(workout)}
                        className="p-2 bg-purple-500 dark:bg-purple-600 text-white rounded-lg hover:bg-purple-600 dark:hover:bg-purple-700 transition"
                        title="Share with buddies"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="p-2 bg-[#AEC3B0] dark:bg-[#6B9071] text-[#0F2A1D] dark:text-[#E3EED4] rounded-lg hover:bg-[#6B9071] dark:hover:bg-[#375534] transition"
                        title="Delete workout"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-secondary dark:text-darkGreen" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                        <p className="font-bold text-gray-900 dark:text-white">{(workout.duration / 60).toFixed(1)} hrs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-accent dark:text-[#AEC3B0]" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                        <p className="font-bold text-gray-900 dark:text-white">{workout.calories}</p>
                      </div>
                    </div>

                    {workout.distance && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary dark:text-accent" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                          <p className="font-bold text-gray-900 dark:text-white">{workout.distance} km</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {workout.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      💭 {workout.notes}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Flame className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No workouts logged yet. Start your fitness journey!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
    </PageTransition>
  )
}
