import { supabase } from "../config/supabaseClient.js"

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { type = "points", limit = 100 } = req.query

    // Fetch all workouts and profiles
    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("user_id, duration, calories")

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, goal")

    if (workoutError || profileError) {
      throw workoutError || profileError
    }

    // Calculate stats per user
    const userStats = {}
    profiles.forEach(profile => {
      userStats[profile.id] = {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        goal: profile.goal,
        workouts: 0,
        minutes: 0,
        calories: 0,
        points: 0
      }
    })

    workouts.forEach(workout => {
      if (userStats[workout.user_id]) {
        userStats[workout.user_id].workouts += 1
        userStats[workout.user_id].minutes += workout.duration || 0
        userStats[workout.user_id].calories += workout.calories || 0
        // Points calculation: 10 per workout + 1 per minute + 0.1 per calorie
        userStats[workout.user_id].points =
          userStats[workout.user_id].workouts * 10 +
          userStats[workout.user_id].minutes * 1 +
          userStats[workout.user_id].calories * 0.1
      }
    })

    // Sort by selected type
    const leaderboard = Object.values(userStats)
      .filter(u => u.workouts > 0) // Only users with workouts
      .sort((a, b) => {
        if (type === "calories") return b.calories - a.calories
        if (type === "minutes") return b.minutes - a.minutes
        if (type === "workouts") return b.workouts - a.workouts
        return b.points - a.points // default: points
      })
      .slice(0, limit)

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }))

    res.json(rankedLeaderboard)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get user rank
export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params
    const { type = "points" } = req.query

    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("user_id, duration, calories")

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, goal")

    if (workoutError || profileError) {
      throw workoutError || profileError
    }

    // Calculate stats per user
    const userStats = {}
    profiles.forEach(profile => {
      userStats[profile.id] = {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        goal: profile.goal,
        workouts: 0,
        minutes: 0,
        calories: 0,
        points: 0
      }
    })

    workouts.forEach(workout => {
      if (userStats[workout.user_id]) {
        userStats[workout.user_id].workouts += 1
        userStats[workout.user_id].minutes += workout.duration || 0
        userStats[workout.user_id].calories += workout.calories || 0
        userStats[workout.user_id].points =
          userStats[workout.user_id].workouts * 10 +
          userStats[workout.user_id].minutes * 1 +
          userStats[workout.user_id].calories * 0.1
      }
    })

    // Sort by selected type
    const leaderboard = Object.values(userStats)
      .filter(u => u.workouts > 0)
      .sort((a, b) => {
        if (type === "calories") return b.calories - a.calories
        if (type === "minutes") return b.minutes - a.minutes
        if (type === "workouts") return b.workouts - a.workouts
        return b.points - a.points
      })

    const userRank = leaderboard.findIndex(u => u.id === userId)

    if (userRank === -1) {
      return res.json({ rank: null, message: "User not on leaderboard" })
    }

    res.json({
      rank: userRank + 1,
      user: leaderboard[userRank]
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get cohort leaderboard (friends only)
export const getCohortLeaderboard = async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50 } = req.query

    // Get user's buddies
    const { data: buddies, error: buddyError } = await supabase
      .from("buddies")
      .select("buddy_id")
      .eq("user_id", userId)
      .eq("status", "connected")

    if (buddyError) throw buddyError

    const buddyIds = buddies.map(b => b.buddy_id)
    buddyIds.push(userId) // Include self

    // Get workouts for buddies
    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("user_id, duration, calories")

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, goal")
      .in("id", buddyIds)

    if (workoutError || profileError) {
      throw workoutError || profileError
    }

    // Calculate stats
    const userStats = {}
    profiles.forEach(profile => {
      userStats[profile.id] = {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        goal: profile.goal,
        workouts: 0,
        minutes: 0,
        calories: 0,
        points: 0
      }
    })

    workouts.forEach(workout => {
      if (userStats[workout.user_id]) {
        userStats[workout.user_id].workouts += 1
        userStats[workout.user_id].minutes += workout.duration || 0
        userStats[workout.user_id].calories += workout.calories || 0
        userStats[workout.user_id].points =
          userStats[workout.user_id].workouts * 10 +
          userStats[workout.user_id].minutes * 1 +
          userStats[workout.user_id].calories * 0.1
      }
    })

    // Sort and rank
    const leaderboard = Object.values(userStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }))

    res.json(leaderboard)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
