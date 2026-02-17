import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { Plus, Edit2, Trash2, Target, Trophy, Zap } from "lucide-react"

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [celebratingGoal, setCelebratingGoal] = useState(null)
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
    if (user) fetchGoals()
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

    if (editingId) {
      await supabase
        .from("fitness_goals")
        .update(formData)
        .eq("id", editingId)

      setEditingId(null)
    } else {
      await supabase.from("fitness_goals").insert([
        {
          user_id: user.id,
          ...formData,
          target: parseFloat(formData.target),
          current: parseFloat(formData.current) || 0
        }
      ])
    }

    setFormData({
      title: "",
      description: "",
      target: "",
      current: "",
      unit: "miles",
      deadline: "",
      category: "distance"
    })
    setShowForm(false)
    fetchGoals()
  }

  const handleDelete = async (id) => {
    if (confirm("Delete this goal?")) {
      await supabase.from("fitness_goals").delete().eq("id", id)
      fetchGoals()
    }
  }

  const handleEdit = (goal) => {
    setFormData(goal)
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

    // Check if goal is completed
    if (updatedProgress >= goal.target && goal.current < goal.target) {
      setCelebratingGoal(goalId)
      setTimeout(() => setCelebratingGoal(null), 5000)

      // Award badge
      await supabase.from("achievements").insert([
        {
          user_id: user.id,
          achievement: "Goal Completed: " + goal.title,
          badge_type: "goal_completed",
          created_at: new Date()
        }
      ])
    }

    fetchGoals()
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
                  <label className="block text-sm font-semibold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                  />
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
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
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

                {/* Category Badge */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-semibold px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-full">
                    {goal.category}
                  </span>
                  {goal.deadline && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
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

        {goals.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No goals yet. Create one to get started!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
    </PageTransition>
  )
}
