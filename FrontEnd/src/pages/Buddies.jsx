import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { matchUsers } from "../utils/MatchUsers"
import { motion } from "framer-motion"

export default function Buddies() {
  const { user } = useAuth()
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
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
        setRecommended(matches)
      }
    }

    fetchUsers()
  }, [user])

  return (
    <PageTransition>
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">
        🔥 Recommended Workout Buddies
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.map((buddy) => (
          <motion.div
            key={buddy.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-5"
          >
            <div className="flex items-center gap-4 mb-3">
              {buddy.avatar_url ? (
                <img
                  src={buddy.avatar_url}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-white">
                  {buddy.username?.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="font-bold text-lg">
                  {buddy.username}
                </h3>
                <p className="text-sm text-gray-500">
                  {buddy.location}
                </p>
              </div>
            </div>

            <p><strong>Goal:</strong> {buddy.goal}</p>
            <p><strong>Workout:</strong> {buddy.workout}</p>

            {buddy.distance && (
              <p className="text-sm text-gray-500">
                📍 {buddy.distance} km away
              </p>
            )}

            <div className="mt-3">
              <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
                <div
                  className="h-2 bg-primary rounded-full"
                  style={{
                    width: `${Math.min(
                      buddy.score * 10,
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="text-sm mt-1">
                Match Score: {buddy.score}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}
