import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getGyms } from "./controllers/gymControllers.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Fitness Buddy API Running" })
})

// Gym Finder Routes
app.get("/api/gyms", getGyms)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

export default app
