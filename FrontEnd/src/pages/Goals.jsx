import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { Plus, Edit2, Trash2, Target, Trophy, Zap, ChevronDown, ChevronUp, Calendar } from "lucide-react"
import { checkGoalAchievements } from "../utils/achievementUtils"

// Calculate automatic deadline based on goal type
const calculateDeadline = (goalType) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (goalType === "daily") {
    // Same day
    return today.toISOString().split('T')[0]
  } else if (goalType === "weekly") {
    // 7 days from today
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return weekLater.toISOString().split('T')[0]
  } else if (goalType === "monthly") {
    // End of current month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return endOfMonth.toISOString().split('T')[0]
  }
  return today.toISOString().split('T')[0]
}

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [celebratingGoal, setCelebratingGoal] = useState(null)
  const [progressHistory, setProgressHistory] = useState({})
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [goalTypeFilter, setGoalTypeFilter] = useState("all")
  const [goalTypeLocal, setGoalTypeLocal] = useState("weekly") // Local state for UI filtering
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    current: "",
    unit: "miles",
    deadline: "",
    category: "distance"
  })

  useEffect(() => {
    if (user) {
      fetchGoals()
      // Load progress history from localStorage
      const savedHistory = localStorage.getItem(`progressHistory_${user.id}`)
      if (savedHistory) {
        setProgressHistory(JSON.parse(savedHistory))
      }
    }
  }, [user])

  const fetchGoals = async () => {
    const { data: goalsData } = await supabase
      .from("fitness_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const { data: workoutsData } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)

    if (goalsData) setGoals(goalsData)
    if (workoutsData) setWorkouts(workoutsData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.target) {
      alert("Please fill in all required fields")
      return
    }

    // Calculate automatic deadline if not manually set
    let deadline = formData.deadline
    if (!deadline) {
      deadline = calculateDeadline(goalTypeLocal)
    }

    if (editingId) {
      const updateData = { ...formData, goal_type: goalTypeLocal, deadline }
      
      const { error } = await supabase
        .from("fitness_goals")
        .update(updateData)
        .eq("id", editingId)
      
      if (error) {
        alert("Error updating goal: " + error.message)
        return
      }

      setEditingId(null)
    } else {
      const newGoal = {
        user_id: user.id,
        ...formData,
        goal_type: goalTypeLocal,
        deadline: deadline,
        target: parseFloat(formData.target),
        current: parseFloat(formData.current) || 0
      }
      
      const { error } = await supabase.from("fitness_goals").insert([newGoal])
      
      if (error) {
        alert("Error creating goal: " + error.message)
        return
      }
    }

    // Reset form completely
    setFormData({
      title: "",
      description: "",
      target: "",
      current: "",
      unit: "miles",
      deadline: "",
      category: "distance"
    })
    setGoalTypeLocal("weekly")
    setShowForm(false)
    setEditingId(null)
    fetchGoals()
    
    // Trigger achievements update IMMEDIATELY
    window.dispatchEvent(new Event('achievementsUpdate'))
    window.dispatchEvent(new Event('leaderboardUpdate'))
  }

  const handleDelete = async (id) => {
    if (confirm("Delete this goal?")) {
      try {
        const { error } = await supabase.from("fitness_goals").delete().eq("id", id)
        if (error) {
          alert("Error deleting goal: " + error.message)
          return
        }
        alert("✓ Goal deleted successfully!")
        fetchGoals()
        // Refresh leaderboard and achievements
        window.dispatchEvent(new Event('leaderboardUpdate'))
        window.dispatchEvent(new Event('achievementsUpdate'))
      } catch (error) {
        alert("Error: " + error.message)
      }
    }
  }

  const handleEdit = (goal) => {
    // Extract goal_type if it exists, otherwise use "weekly"
    const { goal_type, ...goalWithoutType } = goal
    setFormData(goalWithoutType)
    setGoalTypeLocal(goal_type || "weekly")
    setEditingId(goal.id)
    setShowForm(true)
  }

  const updateProgress = async (goalId, newProgress) => {
    const goal = goals.find(g => g.id === goalId)
    const updatedProgress = Math.min(newProgress, goal.target)

    await supabase
      .from("fitness_goals")
      .update({ current: updatedProgress })
      .eq("id", goalId)

    // Track progress update in history with timestamp
    const timestamp = new Date().toISOString()
    const newHistory = {
      ...progressHistory,
      [goalId]: [
        ...(progressHistory[goalId] || []),
        {
          value: updatedProgress,
          timestamp: timestamp,
          previousValue: goal.current
        }
      ]
    }
    setProgressHistory(newHistory)
    localStorage.setItem(`progressHistory_${user.id}`, JSON.stringify(newHistory))

    // Check if goal is completed
    if (updatedProgress >= goal.target && goal.current < goal.target) {
      setCelebratingGoal(goalId)
      setTimeout(() => setCelebratingGoal(null), 5000)

      // Check achievements
      await checkGoalAchievements(user.id)
    }

    fetchGoals()
    
    // Trigger achievements update
    setTimeout(() => {
      window.dispatchEvent(new Event('achievementsUpdate'))
      window.dispatchEvent(new Event('leaderboardUpdate'))
    }, 300)
  }

  const getProgressPercentage = (goal) => {
    return Math.min((goal.current / goal.target) * 100, 100)
  }

  const getProgressColor = (percentage) => {
    if (percentage < 33) return "from-secondary to-accent"
    if (percentage < 66) return "from-darkGreen to-secondary"
    return "from-primary to-secondary"
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      {celebratingGoal && (
        <Confetti numberOfPieces={200} gravity={0.3} recycle={false} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              🎯 Fitness Goals
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and celebrate milestones
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                title: "",
                description: "",
                target: "",
                current: "",
                unit: "miles",
                deadline: "",
                category: "distance"
              })
              setGoalTypeLocal("weekly")
            }}
            className="bg-gradient-to-r from-primary to-secondary text-light px-6 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </motion.button>
        </div>

        {/* Add/Edit Goal Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? "Edit Goal" : "Create New Goal"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Goal Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Run 50 miles"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition\"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Goal Type *</label>
                  <select
                    value={goalTypeLocal}
                    onChange={(e) => setGoalTypeLocal(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                  >
                    <option value="daily">Daily Goal</option>
                    <option value="weekly">Weekly Goal</option>
                    <option value="monthly">Monthly Goal</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {goalTypeLocal === "daily" && "⏱️ Deadline: Today"}
                    {goalTypeLocal === "weekly" && "📅 Deadline: 7 days from today"}
                    {goalTypeLocal === "monthly" && "📊 Deadline: End of month"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition\"
                  >
                    <option value="distance">Distance</option>
                    <option value="duration">Duration</option>
                    <option value="calories">Calories</option>
                    <option value="workouts">Workouts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Target *</label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition\"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                  >
                    <option value="miles">Miles</option>
                    <option value="km">Kilometers</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="calories">Calories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Current Progress</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deadline (Optional)</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Auto: {(() => {
                      const autoDeadline = calculateDeadline(goalTypeLocal)
                      const date = new Date(autoDeadline)
                      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    })()}
                    {formData.deadline && formData.deadline !== calculateDeadline(goalTypeLocal) && (
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">(custom)</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Add notes or motivation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-light font-bold rounded-lg hover:shadow-lg transition"
                >
                  {editingId ? "Update Goal" : "Create Goal"}
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      title: "",
                      description: "",
                      target: "",
                      current: "",
                      unit: "miles",
                      deadline: "",
                      category: "distance"
                    })
                    setGoalTypeLocal("weekly")
                  }}
                  className="flex-1 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Goals Grid */}
        <div className="mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All Goals", color: "from-gray-400 to-gray-500" },
              { value: "daily", label: "📅 Daily", color: "from-blue-500 to-blue-600" },
              { value: "weekly", label: "📆 Weekly", color: "from-purple-500 to-purple-600" },
              { value: "monthly", label: "📊 Monthly", color: "from-green-500 to-green-600" }
            ].map((filter) => (
              <motion.button
                key={filter.value}
                onClick={() => setGoalTypeFilter(filter.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  goalTypeFilter === filter.value
                    ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {goals
            .filter(goal => goalTypeFilter === "all" || goal.goal_type === goalTypeFilter)
            .map((goal, index) => {
            const progress = getProgressPercentage(goal)
            const isCompleted = goal.current >= goal.target

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition ${
                  isCompleted ? "ring-2 ring-green-500" : ""
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Done!
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span className="text-sm font-bold text-secondary dark:text-darkGreen">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full bg-gradient-to-r ${getProgressColor(progress)} rounded-full`}
                    />
                  </div>
                </div>

                {/* Category and Goal Type Badges */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-xs font-semibold px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-full">
                    {goal.category}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    goal.goal_type === 'daily' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' :
                    goal.goal_type === 'weekly' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200' :
                    'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                  }`}>
                    {goal.goal_type === 'daily' ? '📅 Daily' :
                     goal.goal_type === 'weekly' ? '📆 Weekly' :
                     '📊 Monthly'}
                  </span>
                  {goal.deadline && (() => {
                    const deadline = new Date(goal.deadline)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
                    const isOverdue = daysLeft < 0
                    const isToday = daysLeft === 0
                    
                    return (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
                        isOverdue ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' :
                        isToday ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' :
                        daysLeft <= 3 ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {isOverdue ? `Overdue by ${Math.abs(daysLeft)}d` :
                         isToday ? 'Due Today!' :
                         `${daysLeft}d left`}
                      </span>
                    )
                  })()}
                </div>

                {/* Update Progress Input */}
                <div className="mb-4 flex gap-2">
                  <input
                    type="number"
                    placeholder="Add progress"
                    defaultValue="0"
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        updateProgress(goal.id, parseFloat(e.target.value) + goal.current)
                        e.target.value = ""
                      }
                    }}
                    id={`progress-${goal.id}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`progress-${goal.id}`)
                      updateProgress(goal.id, parseFloat(input.value) + goal.current)
                      input.value = ""
                    }}
                    className="px-3 py-2 bg-secondary text-light rounded-lg font-semibold hover:bg-darkGreen transition"
                  >
                    +
                  </button>
                </div>

                {/* Progress History Section */}
                {progressHistory[goal.id] && progressHistory[goal.id].length > 0 && (
                  <motion.div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-gray-700 dark:text-gray-300"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Progress History ({progressHistory[goal.id].length})
                      </span>
                      {expandedGoal === goal.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {expandedGoal === goal.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto"
                      >
                        {progressHistory[goal.id].map((entry, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {entry.previousValue || 0} → {entry.value} {goal.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                📅 {new Date(entry.timestamp).toLocaleDateString()} @ {new Date(entry.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                                +{(entry.value - (entry.previousValue || 0)).toFixed(1)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="flex-1 py-2 bg-primary text-light rounded-lg font-semibold hover:bg-darkGreen transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {goals.filter(goal => goalTypeFilter === "all" || goal.goal_type === goalTypeFilter).length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {goals.length === 0 ? "No goals yet. Create one to get started!" : `No ${goalTypeFilter} goals found.`}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
    </PageTransition>
  )
}
