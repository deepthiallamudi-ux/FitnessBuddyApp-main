import { supabase } from "../config/supabaseClient.js"

// Send buddy request
export const createBuddyRequest = async (req, res) => {
  try {
    const { userId, buddyId } = req.body

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("buddies")
      .select("*")
      .eq("user_id", userId)
      .eq("buddy_id", buddyId)
      .single()

    if (existingRequest) {
      return res.status(400).json({ error: "Buddy request already exists" })
    }

    const { data: buddyRequest, error } = await supabase
      .from("buddies")
      .insert({
        user_id: userId,
        buddy_id: buddyId,
        status: "pending",
        created_at: new Date()
      })
      .select()
      .single()

    if (error) throw error

    res.json(buddyRequest)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user buddy requests
export const getUserBuddies = async (req, res) => {
  try {
    const { userId } = req.params
    const { status = "connected" } = req.query

    const { data: buddies, error } = await supabase
      .from("buddies")
      .select("buddy_id")
      .eq("user_id", userId)
      .eq("status", status)

    if (error) throw error

    if (buddies.length === 0) {
      return res.json([])
    }

    const buddyIds = buddies.map(b => b.buddy_id)

    const { data: buddyProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", buddyIds)

    if (profileError) throw profileError

    res.json(buddyProfiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get pending buddy requests
export const getPendingBuddyRequests = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: requests, error } = await supabase
      .from("buddies")
      .select("user_id")
      .eq("buddy_id", userId)
      .eq("status", "pending")

    if (error) throw error

    if (requests.length === 0) {
      return res.json([])
    }

    const requesterIds = requests.map(r => r.user_id)

    const { data: requesterProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", requesterIds)

    if (profileError) throw profileError

    res.json(requesterProfiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Accept buddy request
export const acceptBuddyRequest = async (req, res) => {
  try {
    const { userId, buddyId } = req.body

    // Update original request to connected
    const { error: error1 } = await supabase
      .from("buddies")
      .update({ status: "connected" })
      .eq("user_id", buddyId)
      .eq("buddy_id", userId)

    if (error1) throw error1

    // Create reciprocal connection
    const { data: reciprocal, error: error2 } = await supabase
      .from("buddies")
      .insert({
        user_id: userId,
        buddy_id: buddyId,
        status: "connected"
      })
      .select()
      .single()

    if (error2) throw error2

    res.json({ message: "Buddy request accepted", data: reciprocal })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Reject buddy request
export const rejectBuddyRequest = async (req, res) => {
  try {
    const { userId, buddyId } = req.body

    const { error } = await supabase
      .from("buddies")
      .delete()
      .eq("user_id", buddyId)
      .eq("buddy_id", userId)

    if (error) throw error

    res.json({ message: "Buddy request rejected" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Remove buddy
export const removeBuddy = async (req, res) => {
  try {
    const { userId, buddyId } = req.body

    // Remove both directions
    await supabase
      .from("buddies")
      .delete()
      .eq("user_id", userId)
      .eq("buddy_id", buddyId)

    await supabase
      .from("buddies")
      .delete()
      .eq("user_id", buddyId)
      .eq("buddy_id", userId)

    res.json({ message: "Buddy removed successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
