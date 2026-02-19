import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { Trophy, Star, Award, Zap, Flame, Facebook, Twitter, Linkedin, Share2 } from "lucide-react"
import PageTransition from "../components/PageTransition"
import { ACHIEVEMENT_BADGES } from "../utils/achievementUtils"

export default function Achievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchAchievements()
    
    // Listen for updates
    const handleUpdate = () => {
      if (user) {
        console.log("Achievement update event triggered, refetching...")
        fetchAchievements()
      }
    }
    
    window.addEventListener('achievementsUpdate', handleUpdate)
    window.addEventListener('leaderboardUpdate', handleUpdate)
    
    return () => {
      window.removeEventListener('achievementsUpdate', handleUpdate)
      window.removeEventListener('leaderboardUpdate', handleUpdate)
    }
  }, [user])

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setAchievements(data || [])
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const shareBadge = (badge) => {
    const text = `🎉 I just unlocked the "${badge.name}" badge on Fitness Buddy! ${badge.icon}\n\n"${badge.description}"\n\nJoin me in my fitness journey and unlock amazing badges! 💪 #FitnessBuddy #Achievements`

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&hashtag=%23FitnessBuddy`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=fitnesbuddy.com`
    }

    return urls
  }

  const handleShare = (badge, platform) => {
    const urls = shareBadge(badge)
    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400")
    }
  }

  const allBadges = Object.values(ACHIEVEMENT_BADGES).map(badge => ({
    ...badge,
    unlocked: achievements.some(a => a.badge_type === badge.id)
  }))

  const rarityColors = {
    common: "from-accent to-light",
    rare: "from-secondary to-darkGreen",
    epic: "from-primary to-secondary",
    legendary: "from-darkGreen to-primary",
    mythic: "from-accent to-darkGreen"
  }

  const rarityBorders = {
    common: "border-gray-500",
    rare: "border-blue-500",
    epic: "border-purple-500",
    legendary: "border-yellow-500",
    mythic: "border-primary"
  }

  const totalPoints = achievements.reduce((sum, a) => {
    const badge = ACHIEVEMENT_BADGES[a.badge_type]
    return sum + (badge?.points || 0)
  }, 0)

  const unlockedCount = achievements.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            🏆 Achievements & Badges
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Earn badges and unlock rewards for your fitness milestones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Badges Unlocked</p>
                <p className="text-4xl font-bold text-primary dark:text-accent">{unlockedCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">of {allBadges.length}</p>
              </div>
              <Trophy className="w-12 h-12 text-primary dark:text-accent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Points</p>
                <p className="text-4xl font-bold text-secondary dark:text-darkGreen">{totalPoints}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">achievement points</p>
              </div>
              <Star className="w-12 h-12 text-secondary dark:text-darkGreen" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((unlockedCount / allBadges.length) * 100)}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">completion</p>
              </div>
              <Zap className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg mb-8"
        >
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Achievement Progress
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / allBadges.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={badge.unlocked ? { scale: 1.05 } : {}}
              className={`relative ${badge.unlocked ? "" : "opacity-60"}`}
            >
              <div
                className={`${
                  badge.unlocked
                    ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-xl border-2 ${rarityBorders[badge.rarity]}`
                    : "bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600"
                } rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center hover:shadow-2xl transition`}
              >
                {badge.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}

                <div className="text-6xl mb-3">{badge.icon}</div>
                <h3 className={`font-bold text-lg mb-1 ${badge.unlocked ? "text-white" : "text-gray-700 dark:text-gray-400"}`}>
                  {badge.name}
                </h3>
                <p className={`text-sm mb-3 ${badge.unlocked ? "text-white/80" : "text-gray-600 dark:text-gray-500"}`}>
                  {badge.description}
                </p>

                <div className="flex items-center justify-center gap-1 mt-auto mb-3">
                  <span className={`text-sm font-bold ${badge.unlocked ? "text-white" : "text-gray-600 dark:text-gray-500"}`}>
                    +{badge.points}
                  </span>
                  <Star className="w-4 h-4" fill="currentColor" />
                </div>

                {badge.unlocked && (
                  <div className="flex gap-2 justify-center mb-2 w-full">
                    <motion.button
                      onClick={() => handleShare(badge, "twitter")}
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare(badge, "facebook")}
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleShare(badge, "linkedin")}
                      whileHover={{ scale: 1.1 }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                      title="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                )}

                {!badge.unlocked && (
                  <div
                    className={`text-xs font-semibold mt-3 px-2 py-1 rounded ${
                      badge.rarity === "mythic"
                        ? "bg-red-200 text-red-700"
                        : badge.rarity === "legendary"
                          ? "bg-yellow-200 text-yellow-700"
                          : badge.rarity === "epic"
                            ? "bg-purple-200 text-purple-700"
                            : badge.rarity === "rare"
                              ? "bg-blue-200 text-blue-700"
                              : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {badge.rarity.toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 mt-8"
          >
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Start working out to unlock your first badge!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Each activity, challenge completed, and milestone achieved brings you closer to unlocking amazing badges.
            </p>
          </motion.div>
        )}

        {/* Badge Legend */}
        {unlockedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rarity Levels</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {Object.entries(rarityColors).map(([rarity, color]) => (
                <div key={rarity} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color}`}></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                    {rarity}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
