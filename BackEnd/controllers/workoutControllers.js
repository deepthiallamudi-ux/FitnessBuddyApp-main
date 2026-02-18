import { supabase } from "../config/supabaseClient.js"

// Create workout
export const createWorkout = async (req, res) => {
  try {
    const { userId, type, duration, distance, calories, notes } = req.body

    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        type,
        duration,
        distance,
        calories,
        notes
      })
      .select()
      .single()

    if (error) throw error

    res.json(workout)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user workouts
export const getUserWorkouts = async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50, offset = 0 } = req.query

    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    res.json(workouts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all workouts (for leaderboard)
export const getAllWorkouts = async (req, res) => {
  try {
    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(workouts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update workout
export const updateWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params
    const { type, duration, distance, calories, notes } = req.body

    const { data: workout, error } = await supabase
      .from("workouts")
      .update({
        type,
        duration,
        distance,
        calories,
        notes,
        updated_at: new Date()
      })
      .eq("id", workoutId)
      .select()
      .single()

    if (error) throw error

    res.json(workout)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete workout
export const deleteWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params

    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId)

    if (error) throw error

    res.json({ message: "Workout deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get workout statistics for a user
export const getWorkoutStats = async (req, res) => {
  try {
    const { userId } = req.params

    const { data: workouts, error } = await supabase
      .from("workouts")
      .select("duration, distance, calories")
      .eq("user_id", userId)

    if (error) throw error

    const stats = {
      totalWorkouts: workouts.length,
      totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      totalDistance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      averageDuration: workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length) : 0
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
