import express from "express"
import { getGyms } from "../controllers/gymControllers.js"

const router = express.Router()

// Gym routes
router.get("/nearby", getGyms) // Get nearby gyms

export default router
