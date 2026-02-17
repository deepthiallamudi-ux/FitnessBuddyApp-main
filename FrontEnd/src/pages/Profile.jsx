import React,{ useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"
import { Camera, MapPin, Trophy, Zap, User, Calendar } from "lucide-react"
import PageTransition from "../components/PageTransition"




export default function Profile() {
  const { user } = useAuth()

  const [username, setUsername] = useState("")
  const [age, setAge] = useState("")
  const [location, setLocation] = useState("")
  const [goal, setGoal] = useState("")
  const [workout, setWorkout] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [weeklyGoal, setWeeklyGoal] = useState(0)
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
      }, (error) => {
        console.log("Geolocation error:", error)
      })
    }
  }, [])


  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
      .eq("id", user.id)
        .single()
        

      if (data) {
        setUsername(data.username || "")
        setAge(data.age || "")
        setLocation(data.location || "")
        setGoal(data.goal || "")
        setWorkout(data.workout || "")
        setWeeklyGoal(data.weekly_goal || 0)
        setAvatarUrl(data.avatar_url || null)
        setLatitude(data.latitude || null)
        setLongitude(data.longitude || null)
     
      }
    }

    fetchProfile()
  }, [user])

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  let uploadedAvatarUrl = avatarUrl

  if (avatarFile) {
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      alert("Error uploading avatar: " + uploadError.message)
      setLoading(false)
      return
    }

    uploadedAvatarUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    age: age ? parseInt(age) : null,
    location,
    goal,
    workout,
    weekly_goal: weeklyGoal,
    avatar_url: uploadedAvatarUrl,
    latitude,
    longitude,
    updated_at: new Date()
  })

  setLoading(false)

  if (error) {
    alert("Error saving profile: " + error.message)
  } else {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }
}


  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up your fitness profile and connect with buddies
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg"
            >
              ✓ Profile saved successfully!
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition">
                  <Camera className="w-4 h-4" />
                  <span>Upload Photo</span>
                </div>
              </label>
            </div>

            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Age
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  placeholder="Your age"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Fitness Goal
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                >
                  <option value="">Select a goal</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="General Fitness">General Fitness</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>

              {/* Preferred Workout */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Preferred Workout
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  value={workout}
                  onChange={(e) => setWorkout(e.target.value)}
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
                  <option value="Martial Arts">Martial Arts</option>
                </select>
              </div>

              {/* Weekly Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Weekly Goal (minutes)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                  placeholder="e.g., 150"
                  min="0"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-light font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "✓ Save Profile"}
            </motion.button>
          </form>
        </div>
      </motion.div>
      </div>
    </PageTransition>
  )
}
