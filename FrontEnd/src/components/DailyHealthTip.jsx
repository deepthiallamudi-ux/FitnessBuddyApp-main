import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Lightbulb } from "lucide-react"

const healthTips = [
  {
    title: "Stay Hydrated",
    tip: "Drink at least 8 glasses of water daily. Proper hydration improves performance and recovery!",
    emoji: "💧"
  },
  {
    title: "Warm Up Before Exercise",
    tip: "Always spend 5-10 minutes warming up to prepare your body and prevent injuries.",
    emoji: "🔥"
  },
  {
    title: "Get 7-9 Hours of Sleep",
    tip: "Quality sleep is essential for muscle recovery and mental health. Aim for consistent bedtime!",
    emoji: "😴"
  },
  {
    title: "Stretch Daily",
    tip: "30 minutes of stretching daily improves flexibility and reduces muscle soreness.",
    emoji: "🧘"
  },
  {
    title: "Eat Protein with Every Meal",
    tip: "Protein aids muscle recovery and keeps you feeling full longer. Aim for 0.7g per pound of body weight.",
    emoji: "🥚"
  },
  {
    title: "Take Rest Days",
    tip: "Rest days are crucial! Your muscles repair and grow during rest, not during workouts.",
    emoji: "😌"
  },
  {
    title: "Mix Your Workouts",
    tip: "Combine cardio, strength training, and flexibility work for optimal fitness gains.",
    emoji: "💪"
  },
  {
    title: "Track Your Progress",
    tip: "Keep a workout journal! Tracking helps you stay motivated and see improvements over time.",
    emoji: "📊"
  },
  {
    title: "Focus on Form",
    tip: "Good form prevents injuries and ensures you're working the right muscles effectively.",
    emoji: "✅"
  },
  {
    title: "Set Realistic Goals",
    tip: "Small, achievable goals are better than big unrealistic ones. Progress over perfection!",
    emoji: "🎯"
  },
  {
    title: "Stay Consistent",
    tip: "Consistency beats intensity. Show up regularly, even on days when motivation is low.",
    emoji: "📈"
  },
  {
    title: "Listen to Your Body",
    tip: "Pain is a signal! Distinguish between muscle soreness and injury. Rest when needed.",
    emoji: "👂"
  }
]

export default function DailyHealthTip() {
  const [showTip, setShowTip] = useState(false)
  const [currentTip, setCurrentTip] = useState(null)
  const [hasSeenTodaysTip, setHasSeenTodaysTip] = useState(false)

  useEffect(() => {
    checkAndShowTip()
  }, [])

  const checkAndShowTip = () => {
    const today = new Date().toDateString()
    const lastTipDate = localStorage.getItem("lastTipDate")
    const tipShownToday = lastTipDate === today

    if (!tipShownToday) {
      // Pick a random tip
      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)]
      setCurrentTip(randomTip)
      setShowTip(true)
      setHasSeenTodaysTip(true)

      // Mark today's tip as shown
      localStorage.setItem("lastTipDate", today)
      localStorage.setItem("lastTipContent", JSON.stringify(randomTip))
    } else {
      setHasSeenTodaysTip(true)
      const savedTip = localStorage.getItem("lastTipContent")
      if (savedTip) {
        setCurrentTip(JSON.parse(savedTip))
      }
    }
  }

  const closeTip = () => {
    setShowTip(false)
  }

  return (
    <AnimatePresence>
      {showTip && currentTip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTip}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-5xl mb-3"
              >
                {currentTip.emoji}
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">{currentTip.title}</h2>

              <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                onClick={closeTip}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6"
              >
                {currentTip.tip}
              </motion.p>

              {/* Health Icons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg"
              >
                <Heart className="w-5 h-5 text-primary animate-pulse" />
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  Your health is your wealth! 💎
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeTip}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg hover:shadow-lg transition"
              >
                Got it! ✨
              </motion.button>

              {/* Daily Reminder Info */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
                💡 New tip daily · Check back tomorrow!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
