import React from 'react'
import { motion } from 'framer-motion'

export default function BeautifulBackground() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black opacity-90"></div>

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full mix-blend-screen opacity-20 blur-3xl"
      ></motion.div>

      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 rounded-full mix-blend-screen opacity-20 blur-3xl"
      ></motion.div>

      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full mix-blend-screen opacity-15 blur-3xl"
      ></motion.div>

      {/* Diagonal Lines Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [Math.random() * 100, -50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          className="absolute w-1 h-1 bg-white rounded-full mix-blend-screen"
          style={{
            left: `${Math.random() * 100}%`,
            top: '100%',
          }}
        ></motion.div>
      ))}

      {/* Glowing Accent Lines */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        ></motion.div>
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        ></motion.div>
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
    </div>
  )
}
