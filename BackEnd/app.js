import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import profileRoutes from "./routes/profileRoutes.js"
import workoutRoutes from "./routes/workoutRoutes.js"
import goalsRoutes from "./routes/goalsRoutes.js"
import achievementsRoutes from "./routes/achievementsRoutes.js"
import buddyRoutes from "./routes/buddyRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import leaderboardRoutes from "./routes/leaderboardRoutes.js"
import gymRoutes from "./routes/gymRoutes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Fitness Buddy API Running" })
})

// API Routes
app.use("/api/profiles", profileRoutes)
app.use("/api/workouts", workoutRoutes)
app.use("/api/goals", goalsRoutes)
app.use("/api/achievements", achievementsRoutes)
app.use("/api/buddies", buddyRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/leaderboard", leaderboardRoutes)
app.use("/api/gyms", gymRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Internal server error", message: err.message })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

export default app
