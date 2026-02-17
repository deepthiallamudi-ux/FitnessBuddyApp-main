import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Trophy, Users, Flame, Medal, Target, TrendingUp } from "lucide-react"
import PageTransition from "../components/PageTransition"

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [groups, setGroups] = useState([])
  const [viewMode, setViewMode] = useState("individual") // individual or group
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    if (user) {
      fetchLeaderboard()
      fetchGroups()
    }
  }, [user, viewMode])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const { data: workouts } = await supabase
        .from("workouts")
        .select("user_id, duration, calories")

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, goal")

      // Calculate stats per user
      const userStats = {}
      profiles.forEach(profile => {
        userStats[profile.id] = {
          username: profile.username,
          avatar_url: profile.avatar_url,
          goal: profile.goal,
          workouts: 0,
          minutes: 0,
          calories: 0,
          points: 0
        }
      })

      workouts?.forEach(workout => {
        if (userStats[workout.user_id]) {
          userStats[workout.user_id].workouts += 1
          userStats[workout.user_id].minutes += workout.duration || 0
          userStats[workout.user_id].calories += workout.calories || 0
          // Points calculation: 10 per workout + 1 per minute + 0.1 per calorie
          userStats[workout.user_id].points = 
            (userStats[workout.user_id].workouts * 10) +
            (userStats[workout.user_id].minutes * 1) +
            (userStats[workout.user_id].calories * 0.1)
        }
      })

      // Sort by points
      const sorted = Object.entries(userStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.points - a.points)

      setLeaderboard(sorted)

      // Find user's rank
      const rank = sorted.findIndex(u => u.id === user.id)
      setUserRank(rank + 1)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      // Mock group data - in production this would come from the database
      const mockGroups = [
        {
          id: 1,
          name: "Morning Runners",
          members: 12,
          totalMinutes: 450,
          totalCalories: 4500,
          image: "🏃"
        },
        {
          id: 2,
          name: "Gym Warriors",
          members: 18,
          totalMinutes: 720,
          totalCalories: 7200,
          image: "🏋️"
        },
        {
          id: 3,
          name: "Yoga Enthusiasts",
          members: 8,
          totalMinutes: 240,
          totalCalories: 1800,
          image: "🧘"
        },
        {
          id: 4,
          name: "HIIT Squad",
          members: 15,
          totalMinutes: 360,
          totalCalories: 5400,
          image: "⚡"
        }
      ]

      setGroups(mockGroups)
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const getMedalColor = (rank) => {
    if (rank === 1) return "from-primary to-secondary"
    if (rank === 2) return "from-secondary to-darkGreen"
    if (rank === 3) return "from-accent to-light"
    return "from-darkGreen to-accent"
  }

  const getMedal = (rank) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compete with the community and climb the ranks
          </p>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Current Rank</p>
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-bold bg-gradient-to-r ${getMedalColor(userRank)} bg-clip-text text-transparent`}>
                    {getMedal(userRank)}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white"># {userRank}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {leaderboard.length - userRank} positions to climb!
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Points</p>
                <p className="text-4xl font-bold text-orange-600">
                  {leaderboard[userRank - 1]?.points.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* View Toggle */}
        <div className="flex gap-4 mb-8 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-lg w-fit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("individual")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              viewMode === "individual"
                ? "bg-gradient-to-r from-primary to-secondary text-light"
                : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Individual
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode("group")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              viewMode === "group"
                ? "bg-gradient-to-r from-primary to-secondary text-light"
                : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Groups
          </motion.button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rankings...</p>
          </div>
        ) : viewMode === "individual" ? (
          // Individual Leaderboard
          <div className="space-y-3">
            {leaderboard.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition ${
                  member.id === user.id ? "ring-2 ring-orange-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Rank */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${getMedalColor(index + 1)} flex items-center justify-center text-white font-bold text-xl`}>
                      {getMedal(index + 1)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {member.username}
                        </p>
                        {member.id === user.id && (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs font-bold rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      {member.goal && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.goal}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:grid grid-cols-3 gap-8 mr-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Workouts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.workouts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Minutes</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{member.minutes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Calories</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{member.calories}</p>
                    </div>
                  </div>

                  {/* Points */}
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Points</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                      {member.points.toFixed(0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Group Leaderboard
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
              >
                {/* Group Icon and Name */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-4xl mb-2">{group.image}</p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getMedalColor(index + 1)} flex items-center justify-center text-white font-bold text-lg`}>
                    {getMedal(index + 1)}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold">Members</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{group.members}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-sm font-semibold">Total Minutes</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{group.totalMinutes}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-semibold">Calories Burned</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{group.totalCalories}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Weekly Progress</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                    ></motion.div>
                  </div>
                </div>

                {/* Join Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  Join Group
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && viewMode === "individual" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start logging workouts to appear on the leaderboard!
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
