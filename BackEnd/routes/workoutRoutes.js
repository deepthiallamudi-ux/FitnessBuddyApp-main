import express from "express"
import {
  createWorkout,
  getUserWorkouts,
  getAllWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutStats
} from "../controllers/workoutControllers.js"

const router = express.Router()

// Workout routes
router.post("/", createWorkout) // Create workout
router.get("/all", getAllWorkouts) // Get all workouts (for aggregation)
router.get("/user/:userId", getUserWorkouts) // Get user's workouts
router.get("/stats/:userId", getWorkoutStats) // Get user stats
router.put("/:workoutId", updateWorkout) // Update workout
router.delete("/:workoutId", deleteWorkout) // Delete workout

export default router
