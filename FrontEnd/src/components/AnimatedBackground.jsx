import { motion } from "framer-motion"

export default function AnimatedBackground() {
  // Floating particle variants
  const particleVariants = {
    animate: (custom) => ({
      y: [0, -100, 0],
      x: [0, custom.direction === "left" ? -50 : 50, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: custom.duration || 8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }
    })
  }

  const floatingVariants = {
    animate: (custom) => ({
      y: [0, -30, 0],
      transition: {
        duration: custom.duration || 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    })
  }

  const rotatingVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  // Bouncing bubble variant
  const bubblingVariants = {
    animate: (custom) => ({
      y: [0, -400, 0],
      x: [0, custom.direction, 0],
      scale: [1, 1.2, 0.8],
      opacity: [0.6, 1, 0],
      transition: {
        duration: custom.duration || 12,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  }

  // Wave variant for water-like effect
  const waveVariants = {
    animate: {
      d: ["M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z", 
           "M0,120 Q250,40 500,120 T1000,120 L1000,200 L0,200 Z", 
           "M0,100 Q250,50 500,100 T1000,100 L1000,200 L0,200 Z"],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534]">

      {/* Base Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 dark:from-[#E3EED4]/5 dark:via-[#AEC3B0]/5 dark:to-[#6B9071]/5" />

      {/* Animated Gradient Mesh Background */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(at 20% 30%, rgba(15, 42, 29, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 70%, rgba(107, 144, 113, 0.3) 0px, transparent 50%),
            radial-gradient(at 40% 60%, rgba(174, 195, 176, 0.2) 0px, transparent 50%)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      {/* Floating Circles - Large Primary */}
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "5%" }}
      />

      {/* Floating Circles - Secondary */}
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-br from-secondary/25 to-accent/15 rounded-full blur-3xl"
        animate={{ 
          x: [0, -80, 0], 
          y: [0, -60, 0],
          scale: [1, 0.95, 1]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ bottom: "15%", right: "10%" }}
      />

      {/* Floating Circles - Accent */}
      <motion.div
        className="absolute w-72 h-72 bg-gradient-to-br from-accent/20 to-light/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, 60, 0], 
          y: [0, 100, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ bottom: "20%", left: "50%" }}
      />

      {/* Bouncing Bubbles - Top left area */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`bubble-1-${i}`}
          className="absolute rounded-full bg-gradient-to-br from-primary/40 to-secondary/30 shadow-lg blur-sm"
          style={{
            width: `${40 + i * 15}px`,
            height: `${40 + i * 15}px`,
            left: `${5 + i * 8}%`,
            bottom: "-100px",
            boxShadow: `0 0 ${20 + i * 5}px rgba(15, 42, 29, 0.15)`
          }}
          variants={bubblingVariants}
          animate="animate"
          custom={{ duration: 10 + i, direction: i % 2 === 0 ? 50 : -50 }}
        />
      ))}

      {/* Bouncing Bubbles - Top right area */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`bubble-2-${i}`}
          className="absolute rounded-full bg-gradient-to-br from-secondary/35 to-accent/25 shadow-lg blur-sm"
          style={{
            width: `${50 + i * 12}px`,
            height: `${50 + i * 12}px`,
            right: `${5 + i * 8}%`,
            bottom: "-100px",
            boxShadow: `0 0 ${25 + i * 4}px rgba(107, 144, 113, 0.12)`
          }}
          variants={bubblingVariants}
          animate="animate"
          custom={{ duration: 12 + i, direction: i % 2 === 0 ? -60 : 60 }}
        />
      ))}

      {/* Particle Stream 1 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`particle-1-${i}`}
          className="absolute w-1 h-1 rounded-full bg-primary"
          custom={{ duration: 8 + i, direction: "left" }}
          variants={particleVariants}
          animate="animate"
          style={{
            left: `${10 + i * 5}%`,
            top: "20%",
            opacity: 0.3 + i * 0.1
          }}
        />
      ))}

      {/* Particle Stream 2 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`particle-2-${i}`}
          className="absolute w-1 h-1 rounded-full bg-secondary"
          custom={{ duration: 10 + i, direction: "right" }}
          variants={particleVariants}
          animate="animate"
          style={{
            right: `${10 + i * 5}%`,
            bottom: "20%",
            opacity: 0.25 + i * 0.08
          }}
        />
      ))}

      {/* Floating Orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${80 + i * 30}px`,
            height: `${80 + i * 30}px`,
            background: `radial-gradient(circle, rgba(107, 144, 113, ${0.15 - i * 0.03}), transparent)`,
            border: `2px solid rgba(174, 195, 176, ${0.1 + i * 0.05})`,
            left: `${15 + i * 30}%`,
            top: `${30 + i * 20}%`
          }}
          variants={floatingVariants}
          animate="animate"
          custom={{ duration: 8 + i * 2 }}
        />
      ))}

      {/* Wave Effect - Bottom */}
      <svg
        className="absolute bottom-0 w-full opacity-30 dark:opacity-15"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        height="200"
      >
        <motion.path
          fill="rgba(15, 42, 29, 0.3)"
          variants={waveVariants}
          animate="animate"
        />
        <motion.path
          fill="rgba(107, 144, 113, 0.2)"
          d="M0,100 Q250,80 500,100 T1000,100 L1000,200 L0,200 Z"
          animate={{
            d: ["M0,100 Q250,80 500,100 T1000,100 L1000,200 L0,200 Z",
                "M0,120 Q250,60 500,120 T1000,120 L1000,200 L0,200 Z",
                "M0,100 Q250,80 500,100 T1000,100 L1000,200 L0,200 Z"]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
        />
      </svg>

      {/* Rotating Grid */}
      <motion.div
        className="absolute inset-0 opacity-5 dark:opacity-10"
        variants={rotatingVariants}
        animate="animate"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(15, 42, 29, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 42, 29, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transformOrigin: 'center'
        }}
      />

      {/* Radial Light Effect */}
      <motion.div
        className="absolute inset-0 opacity-0 dark:opacity-5"
        animate={{
          opacity: [0.02, 0.08, 0.02],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: 'radial-gradient(circle at center, rgba(225, 231, 212, 0.5), transparent 70%)',
        }}
      />

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{
          opacity: [0, 0.03, 0],
          x: [-1000, 1000, -1000],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(225, 231, 212, 0.3), transparent)',
          width: '200%',
        }}
      />
    </div>
  )
}
