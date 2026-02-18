import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Target, Activity, Trophy, Zap, MessageCircle, UserPlus } from "lucide-react"
import PageTransition from "../components/PageTransition"

export default function BuddyProfileView() {
  const { buddyId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [buddy, setBuddy] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [challenges, setChallenges] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (buddyId) {
      fetchBuddyProfile()
    }
  }, [buddyId])

  const fetchBuddyProfile = async () => {
    setLoading(true)
    try {
      // Fetch buddy profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", buddyId)
        .single()

      // Fetch buddy achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", buddyId)

      // Fetch buddy challenges
      const { data: challengesData } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", buddyId)

      // Fetch buddy goals
      const { data: goalsData } = await supabase
        .from("fitness_goals")
        .select("*")
        .eq("user_id", buddyId)

      setBuddy(profile)
      setAchievements(achievementsData || [])
      setChallenges(challengesData || [])
      setGoals(goalsData || [])
    } catch (error) {
      console.error("Error fetching buddy profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = () => {
    navigate("/chat", { state: { buddy } })
  }

  const handleConnect = async () => {
    try {
      const { error } = await supabase.from("buddy_connections").insert([
        {
          requester_id: user.id,
          receiver_id: buddyId,
          status: "connected"
        }
      ])

      if (!error) {
        setAlertMessage(`✅ You are now connected with ${buddy.username}! 🎉`)
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      }
    } catch (error) {
      console.error("Error connecting buddy:", error)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6 flex items-center justify-center">
          <div className="inline-block">
            <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!buddy) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">Buddy not found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-primary text-white rounded-lg"
            >
              Go Back
            </motion.button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
        {/* Alert */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {alertMessage}
          </motion.div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-6"
          >
            {/* Background Gradient */}
            <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>

            {/* Profile Content */}
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 mb-6 -mt-16 relative z-10">
                {buddy.avatar_url ? (
                  <img
                    src={buddy.avatar_url}
                    alt={buddy.username}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl border-4 border-white dark:border-gray-900">
                    💪
                  </div>
                )}

                <div className="flex-1 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {buddy.username}
                  </h1>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Location */}
                {buddy.location && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <p className="text-sm font-semibold">Location</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {buddy.location}
                    </p>
                  </motion.div>
                )}

                {/* Fitness Goal */}
                {buddy.goal && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                      <Target className="w-4 h-4" />
                      <p className="text-sm font-semibold">Fitness Goal</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {buddy.goal}
                    </p>
                  </motion.div>
                )}

                {/* Preferred Workout */}
                {buddy.workout && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
                      <Activity className="w-4 h-4" />
                      <p className="text-sm font-semibold">Preferred Workout</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {buddy.workout}
                    </p>
                  </motion.div>
                )}

                {/* Age */}
                {buddy.age && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                      <Zap className="w-4 h-4" />
                      <p className="text-sm font-semibold">Age</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {buddy.age} years old
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMessage}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConnect}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Connect
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Achievements Section */}
          {achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Achievements ({achievements.length})
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-4 text-center shadow-md hover:shadow-lg transition"
                    title={achievement.badge_type}
                  >
                    <div className="text-3xl mb-2">✓</div>
                    <p className="text-xs font-bold text-white capitalize">
                      {achievement.badge_type.replace(/_/g, " ")}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Challenges Section */}
          {challenges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Challenges ({challenges.length})
                </h2>
              </div>

              <div className="space-y-3">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {challenge.name}
                    </h3>
                    {challenge.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {challenge.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Goals Section */}
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Goals ({goals.length})
                </h2>
              </div>

              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {goal.goal_type || "General"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {goal.current}/{goal.target} {goal.unit}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
