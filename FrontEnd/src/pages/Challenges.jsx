import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { Trophy, Users, Target, Flame, Award, Plus, Zap } from "lucide-react"
import { checkChallengeAchievements } from "../utils/achievementUtils"

export default function Challenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [userChallenges, setUserChallenges] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [celebratingChallenge, setCelebratingChallenge] = useState(null)
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [challengeDetails, setChallengeDetails] = useState(null)
  const [participants, setParticipants] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    unit: "miles",
    duration: "weekly",
    reward_badge: "champion"
  })

  useEffect(() => {
    if (user) {
      fetchChallenges()
      fetchUserChallenges()
    }
  }, [user])

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setChallenges(data)
  }

  const fetchUserChallenges = async () => {
    const { data } = await supabase
      .from("challenge_members")
      .select("challenge_id")
      .eq("user_id", user.id)

    if (data) {
      setUserChallenges(data.map(c => c.challenge_id))
    }
  }

  const fetchChallengeDetails = async (challengeId) => {
    try {
      // Fetch challenge details
      const { data: challenge } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single()

      if (challenge) {
        setChallengeDetails(challenge)
        setSelectedChallenge(challengeId)

        // Fetch all members and their progress
        const { data: members } = await supabase
          .from("challenge_members")
          .select("user_id, progress, joined_at")
          .eq("challenge_id", challengeId)

        if (members && members.length > 0) {
          // Fetch member profiles
          const memberIds = members.map(m => m.user_id)
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", memberIds)

          // Combine member data with profiles
          const enrichedMembers = members.map(member => {
            const profile = profiles?.find(p => p.id === member.user_id)
            return {
              ...member,
              username: profile?.username || "Unknown",
              avatar_url: profile?.avatar_url,
              isOwner: member.user_id === challenge.created_by,
              progressPercent: Math.min((member.progress / challenge.target) * 100, 100)
            }
          })

          setParticipants(enrichedMembers)
        } else {
          setParticipants([])
        }
      }
    } catch (error) {
      console.error("Error fetching challenge details:", error)
    }
  }

  const handleUpdateProgress = async (memberId, newProgress) => {
    try {
      const { error } = await supabase
        .from("challenge_members")
        .update({ progress: parseFloat(newProgress) })
        .eq("id", memberId)

      if (error) throw error

      alert("✅ Progress updated!")
      
      // Check for challenge achievements
      await checkChallengeAchievements(user.id)
      
      // Dispatch achievement update event
      window.dispatchEvent(new Event('achievementsUpdate'))
      
      fetchChallengeDetails(selectedChallenge)
    } catch (error) {
      console.error("Error updating progress:", error)
      alert("Error updating progress: " + error.message)
    }
  }

  const getChallengeStatus = (challenge) => {
    if (!challenge.end_date) return "ongoing"
    const now = new Date()
    const endDate = new Date(challenge.end_date)
    return endDate < now ? "ended" : "ongoing"
  }

  const getDurationDays = (duration) => {
    const durationMap = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90
    }
    return durationMap[duration] || 30
  }

  const formatEndDate = (challenge) => {
    if (!challenge.end_date) {
      const durationDays = getDurationDays(challenge.duration)
      const endDate = new Date(challenge.created_at)
      endDate.setDate(endDate.getDate() + durationDays)
      return endDate.toLocaleDateString()
    }
    return new Date(challenge.end_date).toLocaleDateString()
  }

  const handleJoinChallenge = async (challengeId) => {
    try {
      const { error } = await supabase.from("challenge_members").insert([
        {
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
          joined_at: new Date()
        }
      ])

      if (error) {
        alert("Already joined this challenge!")
        return
      }

      setCelebratingChallenge(challengeId)
      setTimeout(() => setCelebratingChallenge(null), 3000)

      fetchUserChallenges()
    } catch (error) {
      console.error("Error joining challenge:", error)
    }
  }

  const handleCreateChallenge = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.target) {
      alert("Please fill in all required fields")
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

      const { error } = await supabase.from("challenges").insert([
        {
          title: formData.title,
          description: formData.description,
          target: parseFloat(formData.target),
          unit: formData.unit,
          duration: formData.duration,
          reward_badge: formData.reward_badge,
          created_by: user.id,
          created_at: new Date()
        }
      ])

      if (error) {
        alert("Error creating challenge: " + error.message)
        return
      }

      setFormData({
        title: "",
        description: "",
        target: "",
        unit: "miles",
        duration: "weekly",
        reward_badge: "champion"
      })
      setShowForm(false)
      fetchChallenges()
    } catch (error) {
      alert("Error: " + error.message)
    }
  }

  const getProgressPercentage = (challenge) => {
    return Math.min((challenge.current_progress / challenge.target) * 100, 100)
  }

  const badges = {
    champion: { icon: "🏆", label: "Champion", color: "from-primary to-secondary" },
    hero: { icon: "🦸", label: "Hero", color: "from-secondary to-darkGreen" },
    legend: { icon: "👑", label: "Legend", color: "from-accent to-primary" },
    warrior: { icon: "⚔️", label: "Warrior", color: "from-darkGreen to-accent" },
    phoenix: { icon: "🔥", label: "Phoenix", color: "from-secondary to-primary" }
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      {celebratingChallenge && (
        <Confetti numberOfPieces={100} gravity={0.3} recycle={false} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              🎯 Community Challenges
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join challenges, earn badges, and compete with buddies
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-primary to-secondary text-light px-6 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Challenge
          </motion.button>
        </div>

        {/* Create Challenge Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 mb-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Challenge Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Run 50 miles in a month"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Target *</label>
                  <input
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  >
                    <option value="miles">Miles</option>
                    <option value="km">Kilometers</option>
                    <option value="minutes">Minutes</option>
                    <option value="workouts">Workouts</option>
                    <option value="calories">Calories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Reward Badge</label>
                  <select
                    value={formData.reward_badge}
                    onChange={(e) => setFormData({ ...formData, reward_badge: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  >
                    <option value="champion">🏆 Champion</option>
                    <option value="hero">🦸 Hero</option>
                    <option value="legend">👑 Legend</option>
                    <option value="warrior">⚔️ Warrior</option>
                    <option value="phoenix">🔥 Phoenix</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  placeholder="Describe the challenge..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-light font-bold rounded-lg hover:shadow-lg transition"
                >
                  Create Challenge
                </button>
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

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const isJoined = userChallenges.includes(challenge.id)
            const badgeInfo = badges[challenge.reward_badge] || badges.champion
            const memberCount = Math.floor(Math.random() * 50) + 5 // Example count

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition cursor-pointer ${
                  isJoined ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => fetchChallengeDetails(challenge.id)}
              >
                {isJoined && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ✓ Joined
                  </div>
                )}

                {/* Badge */}
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{badgeInfo.icon}</div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Earn: {badgeInfo.label}
                  </p>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                  {challenge.title}
                </h3>
                {challenge.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                    {challenge.description}
                  </p>
                )}

                {/* Challenge Stats */}
                <div className="space-y-3 mb-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {challenge.target} {challenge.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Flame className="w-4 h-4" /> Duration
                    </span>
                    <span className="text-sm font-bold px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-full">
                      {challenge.duration}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Users className="w-4 h-4" /> Participants
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {memberCount}
                    </span>
                  </div>
                </div>

                {/* Join/View Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleJoinChallenge(challenge.id)}
                  disabled={isJoined}
                  className={`w-full py-3 font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                    isJoined
                      ? "bg-green-500 text-white cursor-default"
                      : "bg-gradient-to-r from-primary to-secondary text-light hover:shadow-lg"
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      Keep Going!
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Join Challenge
                    </>
                  )}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {challenges.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No challenges yet. Create one to get started!
            </p>
          </motion.div>
        )}

        {/* Challenge Details Modal */}
        {selectedChallenge && challengeDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedChallenge(null)
              setChallengeDetails(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedChallenge(null)
                  setChallengeDetails(null)
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>

              {/* Challenge Header */}
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{badges[challengeDetails.reward_badge]?.icon || "🏆"}</div>
                <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {challengeDetails.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {challengeDetails.description}
                </p>
                
                {/* Challenge Status */}
                <div className={`inline-block px-4 py-2 rounded-full font-semibold mb-4 ${
                  getChallengeStatus(challengeDetails) === "ongoing"
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                }`}>
                  {getChallengeStatus(challengeDetails) === "ongoing" ? "🔄 Ongoing" : "✅ Ended"}
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <div className="bg-orange-100 dark:bg-orange-900 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Target</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {challengeDetails.target} {challengeDetails.unit}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Duration</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 capitalize">
                      {challengeDetails.duration}
                    </p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ends</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatEndDate(challengeDetails)}
                    </p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Participants</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {participants.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" /> Participants ({participants.length})
                </h3>
                {participants.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {participants.map((participant, idx) => {
                      const isCurrentUser = participant.user_id === user.id
                      const isOwner = participant.isOwner
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-lg ${
                            isOwner
                              ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 border-2 border-yellow-400 dark:border-yellow-600"
                              : "bg-gray-50 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                {participant.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                  {participant.username}
                                  {isOwner && <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-bold">👑 Owner</span>}
                                  {isCurrentUser && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">You</span>}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {participant.progress} / {challengeDetails.target} {challengeDetails.unit}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div
                              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                              style={{ width: `${participant.progressPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 text-right mb-2">
                            {Math.round(participant.progressPercent)}%
                          </p>

                          {/* Update Progress Input (Only for current user if they're a participant) */}
                          {isCurrentUser && !isOwner && getChallengeStatus(challengeDetails) === "ongoing" && (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Update progress..."
                                id={`progress-${participant.id}`}
                                className="flex-1 px-2 py-1 rounded text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                min="0"
                                max={challengeDetails.target}
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`progress-${participant.id}`)
                                  const newProgress = input.value
                                  if (newProgress) {
                                    handleUpdateProgress(participant.id, newProgress)
                                  }
                                }}
                                className="px-3 py-1 bg-green-500 text-white rounded text-sm font-semibold hover:bg-green-600 transition"
                              >
                                Update
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No participants yet. Be the first to join!
                  </p>
                )}
              </div>

              {/* Join Button */}
              {!userChallenges.includes(selectedChallenge) && getChallengeStatus(challengeDetails) === "ongoing" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleJoinChallenge(selectedChallenge)
                    setSelectedChallenge(null)
                    setChallengeDetails(null)
                  }}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Join This Challenge
                </motion.button>
              )}

              {getChallengeStatus(challengeDetails) === "ended" && (
                <motion.button
                  disabled
                  className="w-full bg-gray-400 text-white font-bold py-3 rounded-lg cursor-not-allowed opacity-60"
                >
                  ✅ This challenge has ended
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
      
    </div>
    </PageTransition>
  )
}
