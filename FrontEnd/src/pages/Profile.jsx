import React,{ useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"
import { Camera, MapPin, Trophy, Zap, User, Calendar, Lock, ArrowLeft } from "lucide-react"
import PageTransition from "../components/PageTransition"




export default function Profile() {
  const { user } = useAuth()
  const { userId } = useParams()
  const navigate = useNavigate()
  const isViewingOther = !!userId && userId !== user?.id
  const profileUserId = userId || user?.id

  const [username, setUsername] = useState("")
  const [age, setAge] = useState("")
  const [location, setLocation] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("")
  const [preferredWorkout, setPreferredWorkout] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (navigator.geolocation && !isViewingOther) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
      }, (error) => {
        console.log("Geolocation error:", error)
      })
    }
  }, [isViewingOther])


  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
      .eq("id", profileUserId)
        .single()
        

      if (data) {
        setUsername(data.username || "")
        setAge(data.age || "")
        setLocation(data.location || "")
        setFitnessGoal(data.goal || "")
        setPreferredWorkout(data.workout || "")
        setAvatarUrl(data.avatar_url || null)
        setLatitude(data.latitude || null)
        setLongitude(data.longitude || null)
      }
    }

    fetchProfile()
  }, [user, profileUserId])

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  let uploadedAvatarUrl = avatarUrl

  // Upload avatar if file exists
  if (avatarFile) {
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true })

      if (uploadError) throw uploadError

      uploadedAvatarUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`
    } catch (error) {
      alert("Error uploading avatar: " + error.message)
      setLoading(false)
      return
    }
  }

  try {
    // First try to update existing profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    let error;

    if (existingProfile) {
      // Update existing
      const response = await supabase.from("profiles").update({
        username,
        age: age ? parseInt(age) : null,
        location,
        goal: fitnessGoal,
        workout: preferredWorkout,
        avatar_url: uploadedAvatarUrl,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        updated_at: new Date()
      }).eq("id", user.id)
      
      error = response.error
    } else {
      // Insert new profile
      const response = await supabase.from("profiles").insert([{
        id: user.id,
        email: user.email,
        username: username || user.email,
        age: age ? parseInt(age) : null,
        location,
        goal: fitnessGoal,
        workout: preferredWorkout,
        avatar_url: uploadedAvatarUrl,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        created_at: new Date()
      }])
      
      error = response.error
    }

    setLoading(false)

    if (error) {
      console.error("Profile error:", error)
      alert("Error saving profile: " + error.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  } catch (error) {
    console.error("Error:", error)
    alert("Error: " + error.message)
    setLoading(false)
  }
}


  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6 overflow-hidden">
        {/* Wavy Background */}
        <svg 
          className="absolute top-0 left-0 w-full h-64 opacity-20 dark:opacity-10"
          viewBox="0 0 1000 200" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#FF8C42" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z"
            fill="url(#waveGradient)"
            animate={{
              d: [
                "M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z",
                "M0,120 Q250,70 500,120 T1000,120 L1000,200 L0,200 Z",
                "M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl mx-auto z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Back Button for Viewing Other Users */}
          {isViewingOther && (
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
              whileHover={{ scale: 1.05, x: -5 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
              {isViewingOther ? `${username}'s Profile` : "My Profile"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isViewingOther ? "View buddy's fitness profile" : "Set up your fitness profile and connect with buddies"}
            </p>
            {isViewingOther && (
              <div className="mt-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg inline-block text-sm font-medium">
                📖 Viewing in read-only mode
              </div>
            )}
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

          <form onSubmit={(e) => {
            if (isViewingOther) e.preventDefault()
            else handleSubmit(e)
          }} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {!isViewingOther && (
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
              )}
            </div>

            {/* Form Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition ${isViewingOther ? "text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-75" : ""}`}
                  placeholder="Your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isViewingOther}
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
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition ${isViewingOther ? "text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-75" : ""}`}
                  placeholder="Your age"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={isViewingOther}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Place
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition ${isViewingOther ? "text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-75" : ""}`}
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isViewingOther}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  placeholder="Your email"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Trophy className="w-4 h-4 inline mr-2" />
                  Fitness Goal
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition ${isViewingOther ? "text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-75" : ""}`}
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  disabled={isViewingOther}
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
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition ${isViewingOther ? "text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-75" : ""}`}
                  value={preferredWorkout}
                  onChange={(e) => setPreferredWorkout(e.target.value)}
                  disabled={isViewingOther}
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
            </div>

            {/* Divider */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 my-8"></div>

            {/* Change Password Section */}
            {!isViewingOther && (
              <>
                <motion.button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
                  whileHover={{ scale: 1.02 }}
                >
                  <Lock className="w-4 h-4" />
                  <span>{showPasswordForm ? "Hide" : "Change"} Password</span>
                </motion.button>

                {/* Password Form */}
                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 mt-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {passwordSuccess && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg text-sm"
                      >
                        ✓ Password changed successfully!
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </>
            )}

            {/* Submit Button */}
            {!isViewingOther && (
              <div className="flex gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-light font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "✓ Save Profile"}
                </motion.button>

                {showPasswordForm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    onClick={async (e) => {
                      e.preventDefault()
                      if (newPassword !== confirmPassword) {
                        alert("Passwords don't match!")
                        return
                      }
                      if (newPassword.length < 6) {
                        alert("Password must be at least 6 characters long!")
                        return
                      }
                      setPasswordLoading(true)
                      try {
                        const { error } = await supabase.auth.updateUser({ password: newPassword })
                        setPasswordLoading(false)
                        if (error) {
                          alert("Error changing password: " + error.message)
                      } else {
                        setPasswordSuccess(true)
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                        setTimeout(() => {
                          setPasswordSuccess(false)
                          setShowPasswordForm(false)
                        }, 2000)
                      }
                    } catch (error) {
                      setPasswordLoading(false)
                      alert("Error: " + error.message)
                    }
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-light font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                >
                  {passwordLoading ? "Changing..." : "🔐 Change Password"}
                </motion.button>
              )}
              </div>
            )}
          </form>
        </div>
      </motion.div>
      </div>
    </PageTransition>
  )
}
