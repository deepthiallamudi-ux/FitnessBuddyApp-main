import { supabase } from "../config/supabaseClient.js"

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) throw error

    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params
    const { username, email, age, location, goal, workout, bio, latitude, longitude } = req.body

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        username,
        email,
        age,
        location,
        goal,
        workout,
        bio,
        latitude,
        longitude,
        updated_at: new Date()
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    res.json(profile)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (error) throw error

    res.json({ message: "Profile deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all profiles
export const getAllProfiles = async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(profiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Search profiles
export const searchProfiles = async (req, res) => {
  try {
    const { query } = req.query

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,location.ilike.%${query}%,goal.ilike.%${query}%,workout.ilike.%${query}%`)

    if (error) throw error

    res.json(profiles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
