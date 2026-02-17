import { motion } from "framer-motion"

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">

      <div className="absolute inset-0 bg-gradient-to-br from-[#E3EED4] via-[#AEC3B0] to-[#6B9071]" />

      <motion.div
        className="absolute w-96 h-96 bg-[#0F2A1D]/30 rounded-full blur-3xl"
        animate={{ x: [0, 200, 0], y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        style={{ top: "10%", left: "5%" }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#6B9071]/30 rounded-full blur-3xl"
        animate={{ x: [0, -150, 0], y: [0, -100, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
        style={{ bottom: "10%", right: "5%" }}
      />

    </div>
  )
}
