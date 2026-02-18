import { supabase } from "../config/supabaseClient.js"

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body

    const { data: newMessage, error } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        read: false,
        created_at: new Date()
      })
      .select()
      .single()

    if (error) throw error

    res.json(newMessage)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId, buddyId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json(messages.reverse())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user chats (conversations)
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("sender_id, receiver_id, created_at")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Get unique conversations
    const conversationMap = {}
    messages.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!conversationMap[otherId]) {
        conversationMap[otherId] = msg.created_at
      }
    })

    const conversationIds = Object.keys(conversationMap)

    if (conversationIds.length === 0) {
      return res.json([])
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", conversationIds)

    if (profileError) throw profileError

    res.json(profiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params

    const { data: message, error } = await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("id", messageId)
      .select()
      .single()

    if (error) throw error

    res.json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Mark all messages as read for a conversation
export const markConversationAsRead = async (req, res) => {
  try {
    const { userId, senderId } = req.params

    const { error } = await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("receiver_id", userId)
      .eq("sender_id", senderId)

    if (error) throw error

    res.json({ message: "Conversation marked as read" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("receiver_id", userId)
      .eq("read", false)

    if (error) throw error

    res.json({ unreadCount: messages.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params

    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId)

    if (error) throw error

    res.json({ message: "Message deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
