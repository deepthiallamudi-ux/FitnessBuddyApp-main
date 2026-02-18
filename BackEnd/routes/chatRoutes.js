import express from "express"
import {
  sendMessage,
  getConversation,
  getUserChats,
  markAsRead,
  markConversationAsRead,
  getUnreadCount,
  deleteMessage
} from "../controllers/chatControllers.js"

const router = express.Router()

// Chat routes
router.post("/send", sendMessage) // Send message
router.get("/conversation/:userId/:buddyId", getConversation) // Get conversation
router.get("/user/:userId", getUserChats) // Get all conversations for user
router.get("/unread/:userId", getUnreadCount) // Get unread count
router.put("/:messageId/read", markAsRead) // Mark message as read
router.put("/conversation/:userId/:senderId/read", markConversationAsRead) // Mark conversation as read
router.delete("/:messageId", deleteMessage) // Delete message

export default router
