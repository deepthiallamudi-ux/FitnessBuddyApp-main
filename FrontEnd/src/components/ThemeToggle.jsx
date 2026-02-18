import { useTheme } from "../context/ThemeContext"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const { dark, setDark } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setDark(!dark)}
      className="relative inline-flex h-10 w-16 items-center rounded-full bg-gradient-to-r from-primary to-secondary p-1 transition-all duration-300 shadow-lg hover:shadow-xl"
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {/* Background circle that moves */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md"
      >
        {dark ? (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="text-gray-900"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="text-yellow-500"
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        )}
      </motion.div>

      {/* Labels on toggle */}
      <div className="absolute inset-1 flex items-center justify-between px-2 pointer-events-none">
        <span className={`text-xs font-bold transition-colors ${dark ? "text-gray-400" : "text-light"}`}>
          ☀️
        </span>
        <span className={`text-xs font-bold transition-colors ${dark ? "text-light" : "text-gray-400"}`}>
          🌙
        </span>
      </div>
    </motion.button>
  )
}
