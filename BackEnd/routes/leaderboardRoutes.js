import express from "express"
import {
  getLeaderboard,
  getUserRank,
  getCohortLeaderboard
} from "../controllers/leaderboardControllers.js"

const router = express.Router()

// Leaderboard routes
router.get("/", getLeaderboard) // Get global leaderboard
router.get("/rank/:userId", getUserRank) // Get user's rank
router.get("/cohort/:userId", getCohortLeaderboard) // Get cohort leaderboard (friends only)

export default router
