import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { matchUsers } from "../utils/MatchUsers"
import { motion } from "framer-motion"
import { MessageCircle, UserPlus, CheckCircle, Search } from "lucide-react"

export default function Buddies() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommended, setRecommended] = useState([])
  const [connectedBuddies, setConnectedBuddies] = useState([])
  const [pendingRequests, setPendingRequests] = useState([]) // Requests user sent
  const [incomingRequests, setIncomingRequests] = useState([]) // Requests from others
  const [viewMode, setViewMode] = useState("recommended") // recommended, connected, pending, or incoming
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      setLoading(true)
      try {
        // Dummy buddy recommendations
        const dummyBuddies = [
          {
            id: "dummy-buddy-1",
            username: "Alex Runner",
            email: "alex@fitbuddy.com",
            avatar_url: null,
            goal: "Run 100 miles",
            workout: "Running",
            location: "Downtown",
            score: 8.5,
            isDummy: true
          },
          {
            id: "dummy-buddy-2",
            username: "Sarah Strength",
            email: "sarah@fitbuddy.com",
            avatar_url: null,
            goal: "Build muscle",
            workout: "Gym",
            location: "Uptown",
            score: 8.2,
            isDummy: true
          },
          {
            id: "dummy-buddy-3",
            username: "Mike Fitness",
            email: "mike@fitbuddy.com",
            avatar_url: null,
            goal: "Lose weight",
            workout: "CrossFit",
            location: "Midtown",
            score: 7.9,
            isDummy: true
          }
        ]

        const { data: allUsers } = await supabase
          .from("profiles")
          .select("*")

        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        // Fetch connected buddies
        const { data: buddyList } = await supabase
          .from("buddies")
          .select("buddy_id")
          .eq("user_id", user.id)
          .eq("status", "connected")

        // Fetch pending requests (sent by user)
        const { data: pendingList } = await supabase
          .from("buddies")
          .select("buddy_id")
          .eq("user_id", user.id)
          .eq("status", "pending")

        // Fetch incoming requests (from other users)
        const { data: incomingList } = await supabase
          .from("buddies")
          .select("user_id")
          .eq("buddy_id", user.id)
          .eq("status", "pending")

        if (allUsers && currentProfile) {
          const matches = matchUsers(currentProfile, allUsers)
          // Combine dummy buddies with real matches
          setRecommended([...dummyBuddies, ...matches])
        } else {
          // If no real users, show dummy buddies only
          setRecommended(dummyBuddies)
        }

        if (buddyList && buddyList.length > 0) {
          const buddyIds = buddyList.map(b => b.buddy_id)
          const { data: connectedProfiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", buddyIds)

          if (connectedProfiles) {
            setConnectedBuddies(connectedProfiles)
          }
        }

        // Fetch profiles for pending requests sent by user
        if (pendingList && pendingList.length > 0) {
          const pendingIds = pendingList.map(p => p.buddy_id)
          const { data: pendingProfiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", pendingIds)

          if (pendingProfiles) {
            setPendingRequests(pendingProfiles)
          }
        }

        // Fetch profiles for incoming requests
        if (incomingList && incomingList.length > 0) {
          const incomingIds = incomingList.map(r => r.user_id)
          const { data: incomingProfiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", incomingIds)

          if (incomingProfiles) {
            setIncomingRequests(incomingProfiles)
          }
        }
      } catch (error) {
        console.error("Error fetching buddies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  const handleConnectBuddy = async (buddyId) => {
    try {
      // If it's a dummy buddy, show a message
      if (buddyId.startsWith("dummy-")) {
        alert("👋 This is a demo buddy! In production, you can connect with real users.")
        return
      }

      // Send as pending request, not directly connected
      const { error } = await supabase.from("buddies").insert([
        {
          user_id: user.id,
          buddy_id: buddyId,
          status: "pending"
        }
      ])

      if (error) {
        if (error.message.includes("duplicate")) {
          alert("Already sent a request to this user!")
        } else {
          throw error
        }
        return
      }

      alert("✅ Request sent! Waiting for them to accept...")
      
      // Fetch updated pending list
      const { data: updatedPending } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "pending")

      if (updatedPending && updatedPending.length > 0) {
        const pendingIds = updatedPending.map(p => p.buddy_id)
        const { data: pendingProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", pendingIds)

        if (pendingProfiles) {
          setPendingRequests(pendingProfiles)
        }
      }

      // Also update recommended list
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("*")

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (allUsers && currentProfile) {
        const matches = matchUsers(currentProfile, allUsers)
        // Combine dummy buddies with real matches
        setRecommended([...dummyBuddies, ...matches])
      } else {
        // If no real users, show dummy buddies only
        setRecommended(dummyBuddies)
      }
    } catch (error) {
      alert("Error connecting: " + error.message)
    }
  }

  const handleAcceptRequest = async (requesterId) => {
    try {
      // Update the original request to connected
      const { error: error1 } = await supabase
        .from("buddies")
        .update({ status: "connected" })
        .eq("user_id", requesterId)
        .eq("buddy_id", user.id)

      if (error1) throw error1

      // Create reciprocal connection
      const { error: error2 } = await supabase
        .from("buddies")
        .insert({
          user_id: user.id,
          buddy_id: requesterId,
          status: "connected"
        })

      if (error2) throw error2

      alert("✅ Request accepted!")

      // Refresh incoming and connected lists
      const { data: incomingList } = await supabase
        .from("buddies")
        .select("user_id")
        .eq("buddy_id", user.id)
        .eq("status", "pending")

      const { data: buddyList } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "connected")

      if (incomingList && incomingList.length > 0) {
        const incomingIds = incomingList.map(r => r.user_id)
        const { data: incomingProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", incomingIds)

        if (incomingProfiles) {
          setIncomingRequests(incomingProfiles)
        }
      } else {
        setIncomingRequests([])
      }

      if (buddyList && buddyList.length > 0) {
        const buddyIds = buddyList.map(b => b.buddy_id)
        const { data: connectedProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", buddyIds)

        if (connectedProfiles) {
          setConnectedBuddies(connectedProfiles)
        }
      }
    } catch (error) {
      alert("Error accepting request: " + error.message)
    }
  }

  const handleRejectRequest = async (requesterId) => {
    try {
      const { error } = await supabase
        .from("buddies")
        .delete()
        .eq("user_id", requesterId)
        .eq("buddy_id", user.id)

      if (error) throw error

      alert("✓ Request rejected")

      // Refresh incoming list
      const { data: incomingList } = await supabase
        .from("buddies")
        .select("user_id")
        .eq("buddy_id", user.id)
        .eq("status", "pending")

      if (incomingList && incomingList.length > 0) {
        const incomingIds = incomingList.map(r => r.user_id)
        const { data: incomingProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", incomingIds)

        if (incomingProfiles) {
          setIncomingRequests(incomingProfiles)
        }
      } else {
        setIncomingRequests([])
        setViewMode("recommended")
      }
    } catch (error) {
      alert("Error rejecting request: " + error.message)
    }
  }

  const handleCancelRequest = async (buddyId) => {
    try {
      const { error } = await supabase
        .from("buddies")
        .delete()
        .eq("user_id", user.id)
        .eq("buddy_id", buddyId)

      if (error) throw error

      alert("✓ Request cancelled")

      // Refresh pending list
      const { data: updatedPending } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "pending")

      if (updatedPending && updatedPending.length > 0) {
        const pendingIds = updatedPending.map(p => p.buddy_id)
        const { data: pendingProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", pendingIds)

        if (pendingProfiles) {
          setPendingRequests(pendingProfiles)
        }
      } else {
        setPendingRequests([])
        setViewMode("recommended")
      }
    } catch (error) {
      alert("Error cancelling request: " + error.message)
    }
  }

  const handleChatBuddy = (buddy) => {
    // Navigate to chat and pass buddy info
    navigate("/chat", { state: { buddyId: buddy.id, buddyName: buddy.username } })
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              🤝 Fitness Buddies
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with like-minded fitness enthusiasts and achieve your goals together
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-4 mb-8 bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-lg w-fit flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("recommended")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                viewMode === "recommended"
                  ? "bg-gradient-to-r from-primary to-secondary text-light"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              💡 Recommended
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode("connected")}
              className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                viewMode === "connected"
                  ? "bg-gradient-to-r from-primary to-secondary text-light"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Connected ({connectedBuddies.length})
            </motion.button>
            {pendingRequests.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("pending")}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  viewMode === "pending"
                    ? "bg-gradient-to-r from-primary to-secondary text-light"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                ⏳ Pending ({pendingRequests.length})
              </motion.button>
            )}
            {incomingRequests.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("incoming")}
                className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                  viewMode === "incoming"
                    ? "bg-gradient-to-r from-primary to-secondary text-light"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                📨 Requests ({incomingRequests.length})
              </motion.button>
            )}
          </div>

          {/* Search Bar */}
          {viewMode === "recommended" && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search buddies by name, location, or workout..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                />
              </div>
            </div>
          )} 
          {viewMode === "connected" && (
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search connected buddies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 rounded-full border-4 border-accent border-t-primary animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Finding your perfect match...</p>
            </div>
          ) : (
            <>
              {/* Recommended Buddies */}
              {viewMode === "recommended" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommended.filter(buddy => {
                    const searchLower = searchQuery.toLowerCase()
                    return (
                      buddy.username?.toLowerCase().includes(searchLower) ||
                      buddy.location?.toLowerCase().includes(searchLower) ||
                      buddy.workout?.toLowerCase().includes(searchLower) ||
                      buddy.goal?.toLowerCase().includes(searchLower)
                    )
                  }).length > 0 ? (
                    recommended
                      .filter(buddy => {
                        const searchLower = searchQuery.toLowerCase()
                        return (
                          buddy.username?.toLowerCase().includes(searchLower) ||
                          buddy.location?.toLowerCase().includes(searchLower) ||
                          buddy.workout?.toLowerCase().includes(searchLower) ||
                          buddy.goal?.toLowerCase().includes(searchLower)
                        )
                      })
                      .map((buddy, index) => (
                      <motion.div
                        key={buddy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition p-6"
                      >
                        {/* Avatar and Info */}
                        <div className="flex items-start gap-4 mb-4">
                          {buddy.avatar_url ? (
                            <img
                              src={buddy.avatar_url}
                              alt={buddy.username}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {buddy.username?.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {buddy.username}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📍 {buddy.location || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Goal: {buddy.goal || "Not set"}
                            </p>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-2 border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
                          <p className="text-sm">
                            <strong className="text-gray-700 dark:text-gray-300">Preferred Workout:</strong>{" "}
                            <span className="text-gray-600 dark:text-gray-400">{buddy.workout || "Not set"}</span>
                          </p>
                          {buddy.distance && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📏 {buddy.distance} km away
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Match Score:</p>
                            <div className="flex-1 bg-gray-300 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(buddy.score * 10, 100)}%`
                                }}
                                transition={{ duration: 0.6 }}
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                              />
                            </div>
                            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                              {buddy.score}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConnectBuddy(buddy.id)}
                            className="flex-1 py-2 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Connect
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChatBuddy(buddy)}
                            className="flex-1 py-2 bg-gradient-to-br from-secondary to-accent text-light font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        No recommendations available at this time
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Connected Buddies */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {connectedBuddies
                    .filter(buddy => {
                      const searchLower = searchQuery.toLowerCase()
                      return (
                        buddy.username?.toLowerCase().includes(searchLower) ||
                        buddy.location?.toLowerCase().includes(searchLower) ||
                        buddy.workout?.toLowerCase().includes(searchLower)
                      )
                    })
                    .length > 0 ? (
                    connectedBuddies
                      .filter(buddy => {
                        const searchLower = searchQuery.toLowerCase()
                        return (
                          buddy.username?.toLowerCase().includes(searchLower) ||
                          buddy.location?.toLowerCase().includes(searchLower) ||
                          buddy.workout?.toLowerCase().includes(searchLower)
                        )
                      })
                      .map((buddy, index) => (
                      <motion.div
                        key={buddy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition p-6"
                      >
                        {/* Avatar and Info */}
                        <div className="flex items-start gap-4 mb-4">
                          {buddy.avatar_url ? (
                            <img
                              src={buddy.avatar_url}
                              alt={buddy.username}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {buddy.username?.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {buddy.username}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📍 {buddy.location || "Unknown"}
                            </p>
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold rounded">
                              ✓ Connected
                            </span>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-2 border-t border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
                          <p className="text-sm">
                            <strong className="text-gray-700 dark:text-gray-300">Goal:</strong>{" "}
                            <span className="text-gray-600 dark:text-gray-400">{buddy.goal || "Not set"}</span>
                          </p>
                          <p className="text-sm">
                            <strong className="text-gray-700 dark:text-gray-300">Workout:</strong>{" "}
                            <span className="text-gray-600 dark:text-gray-400">{buddy.workout || "Not set"}</span>
                          </p>
                        </div>

                        {/* Chat Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleChatBuddy(buddy)}
                          className="w-full py-2 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                        No connected buddies yet
                      </p>
                      <button
                        onClick={() => setViewMode("recommended")}
                        className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition"
                      >
                        Find Buddies
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Pending Requests */}
          {viewMode === "pending" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((buddy, index) => (
                  <motion.div
                    key={buddy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {buddy.avatar_url ? (
                        <img
                          src={buddy.avatar_url}
                          alt={buddy.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                          {buddy.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{buddy.username}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">⏳ Waiting for acceptance...</p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCancelRequest(buddy.id)}
                      className="w-full py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold rounded-lg hover:bg-red-200 transition"
                    >
                      ✕ Cancel Request
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
                </div>
              )}
            </div>
          )}

          {/* Incoming Requests */}
          {viewMode === "incoming" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingRequests.length > 0 ? (
                incomingRequests.map((buddy, index) => (
                  <motion.div
                    key={buddy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {buddy.avatar_url ? (
                        <img
                          src={buddy.avatar_url}
                          alt={buddy.username}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                          {buddy.username?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{buddy.username}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">📨 Wants to connect</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptRequest(buddy.id)}
                        className="flex-1 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-semibold rounded-lg hover:bg-green-200 transition"
                      >
                        ✓ Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectRequest(buddy.id)}
                        className="flex-1 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold rounded-lg hover:bg-red-200 transition"
                      >
                        ✕ Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No incoming requests</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
