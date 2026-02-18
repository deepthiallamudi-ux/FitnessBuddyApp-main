import { supabase } from "../config/supabaseClient.js"

// Create achievement
export const createAchievement = async (req, res) => {
  try {
    const { userId, achievement, badge_type } = req.body

    // Check if achievement already exists
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_type", badge_type)
      .single()

    if (existing) {
      return res.json(existing) // Already exists, return existing
    }

    const { data: newAchievement, error } = await supabase
      .from("achievements")
      .insert({
        user_id: userId,
        achievement,
        badge_type
      })
      .select()
      .single()

    if (error) throw error

    res.json(newAchievement)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user achievements
export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: achievements, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all achievements
export const getAllAchievements = async (req, res) => {
  try {
    const { data: achievements, error } = await supabase
      .from("achievements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(achievements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get achievement counts by type
export const getAchievementCounts = async (req, res) => {
  try {
    const { data: achievements, error } = await supabase
      .from("achievements")
      .select("badge_type")

    if (error) throw error

    const counts = {}
    achievements.forEach(ach => {
      counts[ach.badge_type] = (counts[ach.badge_type] || 0) + 1
    })

    res.json(counts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete achievement
export const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params

    const { error } = await supabase
      .from("achievements")
      .delete()
      .eq("id", achievementId)

    if (error) throw error

    res.json({ message: "Achievement deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
