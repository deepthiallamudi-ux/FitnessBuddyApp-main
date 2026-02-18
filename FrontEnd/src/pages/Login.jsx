import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { motion } from "framer-motion"
import AuthBackground from "../components/AuthBackground"
import PageTransition from "../components/PageTransition"
import ThemeToggle from "../components/ThemeToggle"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword
  } = useAuth()

  const { dark } = useTheme()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true })
    }
  }, [user, navigate])

  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!email.trim() || !password.trim()) {
      setMessage("Enter email and password")
      setLoading(false)
      return
    }

    if (isSignup) {
      const { error } = await signUp(email.trim(), password.trim())
      if (error) {
        setMessage(`❌ Error: ${error.message || "Failed to create account"}`)
      } else {
        // If email confirmation is disabled in Supabase, user can login immediately
        // If enabled, show confirmation message
        setMessage("✅ Account created successfully! You can now log in.")
        setEmail("")
        setPassword("")
        setTimeout(() => {
          setIsSignup(false)
          setMessage("")
        }, 3000)
      }
    } else {
      const { error } = await signIn(email.trim(), password.trim())
      if (error) {
        // Check if error is about unconfirmed email
        if (error.message && error.message.includes("not confirmed")) {
          setMessage("⚠️ Email not confirmed yet. Check your email for confirmation link.")
        } else {
          setMessage(`❌ Login Error: ${error.message || "Failed to login"}`)
        }
      } else {
        setMessage("✅ Login successful! Redirecting...")
        setEmail("")
        setPassword("")
        // Wait a moment for auth state to update, then navigate
        setTimeout(() => {
          navigate("/", { replace: true })
        }, 500)
      }
    }

    setLoading(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!email.trim()) {
      setMessage("Enter your email")
      setLoading(false)
      return
    }

    const { error } = await resetPassword(email.trim())
    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Reset link sent to your email!")
      setEmail("")
      setTimeout(() => {
        setIsForgotPassword(false)
        setMessage("")
      }, 3000)
    }

    setLoading(false)
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    try {
      if (provider === "google") {
        await signInWithGoogle()
      } else if (provider === "facebook") {
        await signInWithFacebook()
      }
    } catch (error) {
      setMessage("Social login error: " + error.message)
    }
    setLoading(false)
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen flex">

      <AuthBackground />

      {/* Left Side */}
      <div className="hidden md:flex w-1/2 items-center justify-center text-center p-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6">
            Fitness Buddy
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            🏃 Track goals • 🤝 Find partners • 💪 Stay motivated
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with fitness enthusiasts and achieve your goals together
          </p>
        </motion.div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-[420px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-center flex-1 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {isForgotPassword ? "Reset Password" : (isSignup ? "Create Account" : "Welcome Back")}
            </h2>
            <ThemeToggle />
          </div>

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg mb-4 text-sm font-semibold ${
                message.includes("successful") || message.includes("sent")
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
              }`}
            >
              {message}
            </motion.div>
          )}

          {isForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-light font-bold hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-center text-primary dark:text-secondary hover:underline font-semibold"
              >
                Back to Login
              </button>
            </form>
          ) : (
            /* Login/Signup Form */
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isSignup && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary dark:text-secondary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-light font-bold hover:shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "Loading..." : (isSignup ? "Create Account" : "Login")}
                </motion.button>
              </form>

              <div className="my-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">OR</span>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                >
                  <span>🔴</span> Continue with Google
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <span>f</span> Continue with Facebook
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-light font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                  title="Coming soon - Instagram login integration"
                  disabled
                >
                  <span>📷</span> Continue with Instagram (Coming Soon)
                </motion.button>
              </div>

              <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
                {isSignup ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignup(!isSignup)
                    setMessage("")
                    setEmail("")
                    setPassword("")
                  }}
                  className="ml-2 text-primary dark:text-secondary font-semibold hover:underline"
                >
                  {isSignup ? "Login" : "Sign Up"}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </div>
      </div>
    </PageTransition>
  )
}
