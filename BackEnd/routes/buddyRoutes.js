import express from "express"
import {
  createBuddyRequest,
  getUserBuddies,
  getPendingBuddyRequests,
  acceptBuddyRequest,
  rejectBuddyRequest,
  removeBuddy
} from "../controllers/buddyControllers.js"

const router = express.Router()

// Buddy routes
router.post("/", createBuddyRequest) // Create buddy request
router.get("/user/:userId", getUserBuddies) // Get user's buddies
router.get("/pending/:userId", getPendingBuddyRequests) // Get pending requests
router.post("/accept", acceptBuddyRequest) // Accept buddy request
router.post("/reject", rejectBuddyRequest) // Reject buddy request
router.post("/remove", removeBuddy) // Remove buddy

export default router
