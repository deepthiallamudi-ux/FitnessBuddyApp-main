import { motion } from "framer-motion"

export default function ProgressBar({ percentage }) {
  return (
    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8 }}
        className="h-6 bg-primary"
      />
    </div>
  )
}
