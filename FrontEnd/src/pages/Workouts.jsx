import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import ProgressBar from "../components/ProgressBar"
import { Plus, Share2, Trash2, Flame, Clock, Zap, Facebook, Instagram, Linkedin, Edit2 } from "lucide-react"

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
          // 1. Check for first workout achievement
          const { data: firstWorkout } = await supabase
            .from("achievements")
            .select("*")
            .eq("user_id", user.id)
            .eq("badge_type", "first_workout")
          
          if (firstWorkout && firstWorkout.length === 0) {
            // First workout - create achievement
            await supabase.from("achievements").insert([{
              user_id: user.id,
              badge_type: "first_workout",
              created_at: new Date()
            }])
          }

          // 2. Check for week warrior (7 workouts in last 7 days)
          const { data: weekWarrior } = await supabase
            .from("achievements")
            .select("*")
            .eq("user_id", user.id)
            .eq("badge_type", "week_warrior")
          
          if (weekWarrior && weekWarrior.length === 0) {
            // Check if user has 7+ workouts in last 7 days
            const { data: allWorkouts } = await supabase
              .from("workouts")
              .select("created_at")
              .eq("user_id", user.id)
            
            if (allWorkouts) {
              const last7Days = allWorkouts.filter(w => {
                const workoutDate = new Date(w.created_at)
                const now = new Date()
                const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
                return diff <= 7
              })
              
              if (last7Days.length >= 7) {
                // Award week warrior
                await supabase.from("achievements").insert([{
                  user_id: user.id,
                  badge_type: "week_warrior",
                  created_at: new Date()
                }])
              }
            }
          }

          // 3. Check for calorie blaster (5000 calories in a month)
          const { data: calorieBlaster } = await supabase
            .from("achievements")
            .select("*")
            .eq("user_id", user.id)
            .eq("badge_type", "calorie_blaster")
          
          if (calorieBlaster && calorieBlaster.length === 0) {
            const { data: monthWorkouts } = await supabase
              .from("workouts")
              .select("calories")
              .eq("user_id", user.id)
            
            if (monthWorkouts) {
              const lastMonth = monthWorkouts.filter(w => {
                const workoutDate = new Date(w.created_at)
                const now = new Date()
                const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
                return diff <= 30
              })
              
              const totalCalories = lastMonth.reduce((sum, w) => sum + (w.calories || 0), 0)
              if (totalCalories >= 5000) {
                // Award calorie blaster
                await supabase.from("achievements").insert([{
                  user_id: user.id,
                  badge_type: "calorie_blaster",
                  created_at: new Date()
                }])
              }
            }
          }
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

    const totalDuration = last7Days.reduce((acc, w) => acc + (w.duration || 0), 0)
    const totalCalories = last7Days.reduce((acc, w) => acc + (w.calories || 0), 0)
    const totalWorkouts = last7Days.length

    return { totalDuration, totalCalories, totalWorkouts }
  }

  const summary = weeklySummary()
  const progressPercent = weeklyGoal > 0 ? Math.min((summary.totalDuration / weeklyGoal) * 100, 100) : 0

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
              <span className="font-semibold text-gray-700 dark:text-gray-300">Weekly Goal Progress</span>
              <span className="text-lg font-bold text-primary dark:text-accent">
                {(summary.totalDuration / 60).toFixed(1)} / {weeklyGoal} hours ({Math.round(progressPercent)}%)
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
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Duration</span>
              </div>
              <p className="text-3xl font-bold text-secondary dark:text-darkGreen">{summary.totalDuration}m</p>
            </div>

            <div className="bg-gradient-to-br from-[#AEC3B0] to-[#E3EED4] dark:from-[#6B9071] dark:to-[#375534] p-4 rounded-lg\">
              <div className="flex items-center gap-2 mb-2\">
                <Flame className="w-5 h-5 text-accent dark:text-[#AEC3B0]\" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300\">Calories</span>
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
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="p-2 bg-[#AEC3B0] dark:bg-[#6B9071] text-[#0F2A1D] dark:text-[#E3EED4] rounded-lg hover:bg-[#6B9071] dark:hover:bg-[#375534] transition"
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
