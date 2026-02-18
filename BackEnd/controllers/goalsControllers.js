import { supabase } from "../config/supabaseClient.js"

// Create goal
export const createGoal = async (req, res) => {
  try {
    const { userId, title, description, category, goal_type, target, unit, deadline } = req.body

    const { data: goal, error } = await supabase
      .from("fitness_goals")
      .insert({
        user_id: userId,
        title,
        description,
        category,
        goal_type,
        target,
        unit,
        deadline,
        current: 0,
        completed: false
      })
      .select()
      .single()

    if (error) throw error

    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user goals
export const getUserGoals = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: goals, error } = await supabase
      .from("fitness_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(goals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params
    const { title, description, target, current, completed, deadline } = req.body

    const { data: goal, error } = await supabase
      .from("fitness_goals")
      .update({
        title,
        description,
        target,
        current,
        completed,
        deadline,
        updated_at: new Date()
      })
      .eq("id", goalId)
      .select()
      .single()

    if (error) throw error

    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update goal progress
export const updateGoalProgress = async (req, res) => {
  try {
    const { goalId } = req.params
    const { current } = req.body

    const { data: goal, error } = await supabase
      .from("fitness_goals")
      .update({ current, updated_at: new Date() })
      .eq("id", goalId)
      .select()
      .single()

    if (error) throw error

    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Mark goal as completed
export const completeGoal = async (req, res) => {
  try {
    const { goalId } = req.params

    const { data: goal, error } = await supabase
      .from("fitness_goals")
      .update({ completed: true, updated_at: new Date() })
      .eq("id", goalId)
      .select()
      .single()

    if (error) throw error

    res.json(goal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params

    const { error } = await supabase
      .from("fitness_goals")
      .delete()
      .eq("id", goalId)

    if (error) throw error

    res.json({ message: "Goal deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all goals for leaderboard
export const getAllGoals = async (req, res) => {
  try {
    const { data: goals, error } = await supabase
      .from("fitness_goals")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(goals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
