import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Trophy, Users, Flame, Medal, Target, TrendingUp, Check, X, MessageCircle, UserPlus } from "lucide-react"
import PageTransition from "../components/PageTransition"
import { checkLeaderboardAchievements } from "../utils/achievementUtils"

export default function Leaderboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [groups, setGroups] = useState([])
  const [viewMode, setViewMode] = useState("individual") // individual or group
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)
  const [joinedGroups, setJoinedGroups] = useState([])
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [selectedBuddy, setSelectedBuddy] = useState(null)
  const [buddyAchievements, setBuddyAchievements] = useState([])
  const [buddyChallenges, setBuddyChallenges] = useState([])

  useEffect(() => {
    if (user) {
      fetchLeaderboard()
      fetchGroups()
      fetchJoinedGroups()
    }
    
    // Listen for updates from deletions
    const handleUpdate = () => {
      if (user) {
        fetchLeaderboard()
      }
    }
    
    window.addEventListener('leaderboardUpdate', handleUpdate)
    return () => window.removeEventListener('leaderboardUpdate', handleUpdate)
  }, [user, viewMode])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Fetch all workouts - now with public read access
      const { data: workouts, error: workoutError } = await supabase
        .from("workouts")
        .select("user_id, duration, calories")

      if (workoutError) {
        console.warn("Workout fetch warning:", workoutError?.message)
      }

      // Fetch all profiles with proper error handling
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, goal")

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        throw profileError
      }

      // Ensure we have data
      if (!profiles || profiles.length === 0) {
        console.warn("No profiles found")
        setLeaderboard([])
        setUserRank(null)
        setLoading(false)
        return
      }

      // Calculate stats per user
      const userStats = {}
      profiles.forEach(profile => {
        userStats[profile.id] = {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          goal: profile.goal,
          workouts: 0,
          minutes: 0,
          calories: 0,
          points: 0
        }
      })

      // If we have workouts, calculate stats
      if (workouts && workouts.length > 0) {
        console.log(`Processing ${workouts.length} workouts for leaderboard`)
        workouts.forEach(workout => {
          if (userStats[workout.user_id]) {
            const duration = workout.duration || 0
            const calories = workout.calories || 0
            
            userStats[workout.user_id].workouts += 1
            userStats[workout.user_id].minutes += duration
            userStats[workout.user_id].calories += calories
          }
        })
      } else {
        console.log("No workouts found in database")
      }

      // Calculate points for all users
      Object.keys(userStats).forEach(userId => {
        const stats = userStats[userId]
        // Points: 10 per workout + 1 per minute + 0.1 per calorie
        stats.points = (stats.workouts * 10) + (stats.minutes * 1) + (stats.calories * 0.1)
      })

      // Sort by points descending
      const sortedLeaderboard = Object.values(userStats)
        .filter(user => user.points > 0) // Show only users with activity
        .sort((a, b) => b.points - a.points)
        .map((userStat, index) => ({ ...userStat, rank: index + 1 }))

      console.log(`Leaderboard created with ${sortedLeaderboard.length} active users`)
      setLeaderboard(sortedLeaderboard)

      // Calculate user's rank
      const userEntry = sortedLeaderboard.find(u => u.id === user?.id)
      if (userEntry) {
        setUserRank(userEntry.rank)
        
        // Check for top 10 achievement
        if (userEntry.rank <= 10) {
          await checkLeaderboardAchievements(user.id)
        }
      } else {
        setUserRank(null)
      }
    } catch (error) {
      console.error("Leaderboard fetch error:", error)
      setLeaderboard([])
      setUserRank(null)
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
          image: "🏃",
          description: "For early birds who love running"
        },
        {
          id: 2,
          name: "Gym Warriors",
          members: 18,
          totalMinutes: 720,
          totalCalories: 7200,
          image: "🏋️",
          description: "Strength training enthusiasts"
        },
        {
          id: 3,
          name: "Yoga Enthusiasts",
          members: 8,
          totalMinutes: 240,
          totalCalories: 1800,
          image: "🧘",
          description: "Mindfulness and flexibility focus"
        },
        {
          id: 4,
          name: "HIIT Squad",
          members: 15,
          totalMinutes: 360,
          totalCalories: 5400,
          image: "⚡",
          description: "High intensity interval training"
        }
      ]

      setGroups(mockGroups)
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const handleGroupClick = (group) => {
    // Generate member data for the group
    const memberNames = {
      1: ["John Smith", "Emma Wilson", "David Brown", "Lisa Anderson", "Mike Johnson", "Sarah Davis", "Tom Miller", "Jessica Lee", "Chris Taylor", "Rachel White", "Alex Martinez", "Nicole Harris"],
      2: ["James Garcia", "Emily Rodriguez", "Robert Lewis", "Jennifer Garcia", "Michael Harris", "Laura White", "Daniel Clark", "Amanda Lewis", "Ryan Lopez", "Sophia White", "David Jackson", "Olivia Martin", "Joseph Thompson", "Charlotte Garcia", "Thomas Martinez", "Amelia Robinson", "Charles Walker", "Isabella Hall"],
      3: ["Daniel Chen", "Priyanka Singh", "Marcus Johnson", "Nora Williams", "Ethan Brown", "Mia Davis", "Benjamin Lee", "Sophia Kumar"],
      4: ["Alex Rivera", "Jordan Kim", "Casey Wang", "Morgan Lee", "Phoenix Stone", "Raven Black", "Sterling Silver", "Morgan Gold", "Dakota Blue", "Skyler Green", "River Red", "Ocean White", "Forest Brown", "Sky Gray", "Star Yellow"]
    }

    const names = memberNames[group.id] || []
    const members = names.map((name, idx) => ({
      id: `member-${idx}`,
      username: name,
      workouts: Math.floor(Math.random() * 20) + 5,
      minutes: Math.floor(Math.random() * 300) + 50,
      calories: Math.floor(Math.random() * 3000) + 500,
      points: Math.floor(Math.random() * 5000) + 1000,
      avatar: null
    })).sort((a, b) => b.points - a.points)

    setGroupMembers(members)
    setSelectedGroup(group)
  }

  const closeGroupModal = () => {
    setSelectedGroup(null)
    setGroupMembers([])
  }

  const fetchJoinedGroups = async () => {
    try {
      // In production, fetch from database
      // For now, using mock data
      const joined = JSON.parse(localStorage.getItem(`joined_groups_${user.id}`) || "[]")
      setJoinedGroups(joined)
    } catch (error) {
      console.error("Error fetching joined groups:", error)
    }
  }

  const handleJoinGroup = async (group) => {
    try {
      if (joinedGroups.includes(group.id)) {
        setAlertMessage(`❌ You're already a member of ${group.name}!`)
      } else {
        // Save to localStorage for now (in production, would save to database)
        const updated = [...joinedGroups, group.id]
        setJoinedGroups(updated)
        localStorage.setItem(`joined_groups_${user.id}`, JSON.stringify(updated))
        
        setAlertMessage(`✅ Successfully joined ${group.name}! 🎉`)
      }
      
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 4000)
    } catch (error) {
      setAlertMessage(`❌ Error joining group: ${error.message}`)
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 4000)
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

  const openBuddyModal = async (member) => {
    setSelectedBuddy(member)
    
    // Fetch buddy achievements
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", member.id)

    // Fetch buddy challenges
    const { data: challenges } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", member.id)

    setBuddyAchievements(achievements || [])
    setBuddyChallenges(challenges || [])
  }

  const closeBuddyModal = () => {
    setSelectedBuddy(null)
    setBuddyAchievements([])
    setBuddyChallenges([])
  }

  const handleMessageBuddy = () => {
    if (selectedBuddy) {
      closeBuddyModal()
      navigate("/chat", { state: { buddy: selectedBuddy } })
    }
  }

  const handleConnectBuddy = async () => {
    if (selectedBuddy && user) {
      try {
        const { error } = await supabase.from("buddy_connections").insert([
          {
            requester_id: user.id,
            receiver_id: selectedBuddy.id,
            status: "connected"
          }
        ])

        if (!error) {
          setAlertMessage(`✅ You are now connected with ${selectedBuddy.username}! 🎉`)
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 3000)
          closeBuddyModal()
        }
      } catch (error) {
        console.error("Error connecting buddy:", error)
      }
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      {/* Alert Notification */}
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-white dark:bg-gray-900 shadow-xl rounded-lg p-4 max-w-sm z-50"
        >
          <p className="text-gray-900 dark:text-white font-semibold text-sm">
            {alertMessage}
          </p>
        </motion.div>
      )}

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
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => member.id !== user.id && openBuddyModal(member)}
                className={`cursor-pointer bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition ${
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
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer"
                onClick={() => handleGroupClick(group)}
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

                {/* Join/View Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleJoinGroup(group)
                  }}
                  disabled={joinedGroups.includes(group.id)}
                  className={`w-full py-2 font-bold rounded-lg transition ${
                    joinedGroups.includes(group.id)
                      ? "bg-green-500 text-white opacity-80"
                      : "bg-gradient-to-r from-primary to-secondary text-light hover:shadow-lg"
                  }`}
                >
                  {joinedGroups.includes(group.id) ? (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Joined
                    </>
                  ) : (
                    "Join Group"
                  )}
                </motion.button>

                {/* Click hint */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 font-semibold">
                  Click to view members →
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Group Members Modal */}
        <AnimatePresence>
          {selectedGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeGroupModal}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{selectedGroup.image}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {groupMembers.length} Members
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeGroupModal}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>

                {/* Members List */}
                <div className="p-6 space-y-3">
                  {groupMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition"
                    >
                      {/* Rank & Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getMedalColor(index + 1)} flex items-center justify-center text-white font-bold text-sm`}>
                        {getMedal(index + 1)}
                      </div>

                      {/* Member Info */}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {member.username}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.workouts} workouts • {member.minutes}m total
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Calories</p>
                          <p className="font-bold text-red-600 dark:text-red-400">{member.calories}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Points</p>
                          <p className="font-bold text-orange-600 dark:text-orange-400">{member.points}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Buddy Card Modal */}
        <AnimatePresence>
          {selectedBuddy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBuddyModal}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
              >
                {/* Header with Gradient Background */}
                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeBuddyModal}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-4">
                    {selectedBuddy.avatar_url ? (
                      <img
                        src={selectedBuddy.avatar_url}
                        alt={selectedBuddy.username}
                        className="w-16 h-16 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-3xl">
                        💪
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedBuddy.username}
                      </h2>
                      <p className="text-white/80 text-sm">Rank #{leaderboard.findIndex(m => m.id === selectedBuddy.id) + 1}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Workouts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBuddy.workouts}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Minutes</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedBuddy.minutes}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Calories</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedBuddy.calories}</p>
                    </div>
                  </div>

                  {/* Goal */}
                  {selectedBuddy.goal && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Target className="w-4 h-4 inline mr-2" />
                        Goal
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedBuddy.goal}
                      </p>
                    </div>
                  )}

                  {/* Achievements */}
                  {buddyAchievements.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Achievements ({buddyAchievements.length})
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {buddyAchievements.slice(0, 5).map(achievement => (
                          <div
                            key={achievement.id}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg shadow-md"
                            title={achievement.badge_type}
                          >
                            ✓
                          </div>
                        ))}
                        {buddyAchievements.length > 5 && (
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                            +{buddyAchievements.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Challenges */}
                  {buddyChallenges.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                        <Flame className="w-4 h-4 mr-2" />
                        Challenges ({buddyChallenges.length})
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {buddyChallenges.slice(0, 3).map(challenge => (
                          <div
                            key={challenge.id}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full"
                          >
                            {challenge.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMessageBuddy}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConnectBuddy}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
    </PageTransition>
  )
}
