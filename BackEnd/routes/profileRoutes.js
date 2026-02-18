import express from "express"
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles,
  searchProfiles
} from "../controllers/profileControllers.js"

const router = express.Router()

// Profile routes
router.get("/", getAllProfiles) // Get all profiles
router.get("/:userId", getProfile) // Get single profile
router.put("/:userId", updateProfile) // Update profile
router.delete("/:userId", deleteProfile) // Delete profile
router.get("/search/query", searchProfiles) // Search profiles

export default router
