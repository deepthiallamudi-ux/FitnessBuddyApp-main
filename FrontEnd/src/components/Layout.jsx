import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import AnimatedBackground from "./AnimatedBackground"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Layout({ children }) {
  const { logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Profile", path: "/profile", icon: "👤" },
    { name: "Goals", path: "/goals", icon: "🎯" },
    { name: "Workouts", path: "/workouts", icon: "💪" },
    { name: "Buddies", path: "/buddies", icon: "🤝" },
    { name: "Challenges", path: "/challenges", icon: "🏆" },
    { name: "Achievements", path: "/achievements", icon: "⭐" },
    { name: "Gym Finder", path: "/gym-finder", icon: "🗺️" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏅" },
    { name: "Resources", path: "/resources", icon: "📚" },
    { name: "Chat", path: "/chat", icon: "💬" }
  ]

  const navVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  return (
    <div className="relative min-h-screen flex text-gray-800 dark:text-gray-100 bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534]">

      <AnimatedBackground />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-white/60 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/30 dark:border-gray-700/30 shadow-xl p-6 flex flex-col justify-between z-20 transition-all duration-300`}
      >

        <div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-between mb-10"
          >
            <h1 className={`text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${
              !sidebarOpen && "hidden"
            }`}>
              Fitness Buddy
            </h1>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </motion.div>

          <motion.nav 
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navItems.map((item, i) => (
              <motion.div
                key={item.path}
                variants={navVariants}
                custom={i}
              >
                <Link
                  to={item.path}
                  className={`group relative block px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-primary to-secondary text-light shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className={!sidebarOpen ? "hidden" : ""}>
                      {item.name}
                    </span>
                  </motion.div>
                  
                  {/* Active indicator */}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Hover glow effect */}
                  <motion.div
                    whileHover={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    className="absolute inset-0 rounded-lg bg-primary/10 -z-10 blur-sm"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="bg-gradient-to-r from-primary to-secondary text-light py-3 rounded-lg hover:shadow-lg transition w-full font-semibold"
        >
          {sidebarOpen ? "Logout" : "🚪"}
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="flex-1 overflow-auto z-10"
      >
        {children}
      </motion.div>
    </div>
  )
}
