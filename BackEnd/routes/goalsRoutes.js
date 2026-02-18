import express from "express"
import {
  createGoal,
  getUserGoals,
  updateGoal,
  updateGoalProgress,
  completeGoal,
  deleteGoal,
  getAllGoals
} from "../controllers/goalsControllers.js"

const router = express.Router()

// Goals routes
router.post("/", createGoal) // Create goal
router.get("/all", getAllGoals) // Get all goals
router.get("/user/:userId", getUserGoals) // Get user's goals
router.put("/:goalId", updateGoal) // Update goal
router.put("/:goalId/progress", updateGoalProgress) // Update goal progress
router.put("/:goalId/complete", completeGoal) // Mark goal as complete
router.delete("/:goalId", deleteGoal) // Delete goal

export default router
