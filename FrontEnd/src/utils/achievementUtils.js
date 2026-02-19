import { supabase } from "../lib/supabase"

// Define all achievement badges with their criteria
export const ACHIEVEMENT_BADGES = {
  first_workout: {
    id: "first_workout",
    name: "First Step",
    description: "Log your first workout",
    icon: "👟",
    points: 10,
    rarity: "common",
    criteria: "first_workout"
  },
  week_warrior: {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Complete 7 workouts in a week",
    icon: "💪",
    points: 50,
    rarity: "rare",
    criteria: "week_warrior"
  },
  goal_crusher: {
    id: "goal_crusher",
    name: "Goal Crusher",
    description: "Complete your first fitness goal",
    icon: "🎯",
    points: 100,
    rarity: "legendary",
    criteria: "goal_completed"
  },
  social_butterfly: {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Connect with 5 fitness buddies",
    icon: "🦋",
    points: 75,
    rarity: "epic",
    criteria: "5_buddies"
  },
  challenge_winner: {
    id: "challenge_winner",
    name: "Champion",
    description: "Win a community challenge",
    icon: "🏆",
    points: 150,
    rarity: "legendary",
    criteria: "challenge_completed"
  },
  streak_master: {
    id: "streak_master",
    name: "Streak Master",
    description: "Maintain a 30-day workout streak",
    icon: "🔥",
    points: 200,
    rarity: "mythic",
    criteria: "30_day_streak"
  },
  calorie_blaster: {
    id: "calorie_blaster",
    name: "Calorie Blaster",
    description: "Burn 5,000 calories in a month",
    icon: "🔥",
    points: 120,
    rarity: "epic",
    criteria: "5000_calories"
  },
  leaderboard_top10: {
    id: "leaderboard_top10",
    name: "Elite Athlete",
    description: "Reach top 10 in leaderboard",
    icon: "🥇",
    points: 180,
    rarity: "legendary",
    criteria: "top_10_leaderboard"
  },
  social_diva: {
    id: "social_diva",
    name: "Social Diva",
    description: "Share your progress more than 10 times",
    icon: "📱",
    points: 50,
    rarity: "rare",
    criteria: "10_shares"
  },
  explorer: {
    id: "explorer",
    name: "Explorer",
    description: "Save 3 or more gyms to your favorites",
    icon: "🗺️",
    points: 40,
    rarity: "common",
    criteria: "3_gyms_saved"
  }
}

/**
 * Check and award achievements when a workout is logged
 */
export const checkWorkoutAchievements = async (userId) => {
  try {
    console.log(`Checking workout achievements for user: ${userId}`)
    
    // Check for First Workout badge
    const { data: workouts, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (workoutError) {
      console.error("Error fetching workouts:", workoutError)
      return false
    }

    console.log(`User has ${workouts?.length || 0} workouts`)

    if (workouts && workouts.length === 1) {
      console.log("New user - awarding first workout badge")
      await awardAchievement(userId, "first_workout")
    }

    // Check for Week Warrior badge (7 workouts in a week)
    if (workouts && workouts.length >= 7) {
      const lastWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.created_at)
        const now = new Date()
        const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
        return diff <= 7
      })

      if (lastWeekWorkouts.length >= 7) {
        await awardAchievement(userId, "week_warrior")
      }
    }

    // Check for Calorie Blaster badge (5000 calories in a month)
    if (workouts) {
      const lastMonthWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.created_at)
        const now = new Date()
        const diff = (now - workoutDate) / (1000 * 60 * 60 * 24)
        return diff <= 30
      })

      const totalCalories = lastMonthWorkouts.reduce((sum, w) => {
        return sum + (w.calories || 0)
      }, 0)

      if (totalCalories >= 5000) {
        await awardAchievement(userId, "calorie_blaster")
      }
    }

    // Check for Streak Master badge (30-day workout streak)
    if (workouts && workouts.length > 0) {
      const hasStreak = checkWorkoutStreak(workouts, 30)
      if (hasStreak) {
        await awardAchievement(userId, "streak_master")
      }
    }

    return true
  } catch (error) {
    console.error("Error checking workout achievements:", error)
    return false
  }
}

/**
 * Check and award achievements when a buddy is connected
 */
export const checkBuddyAchievements = async (userId) => {
  try {
    const { data: buddies } = await supabase
      .from("buddies")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "connected")

    if (buddies && buddies.length === 5) {
      await awardAchievement(userId, "social_butterfly")
    }

    return true
  } catch (error) {
    console.error("Error checking buddy achievements:", error)
    return false
  }
}

/**
 * Check and award achievements when a fitness goal is completed
 */
export const checkGoalAchievements = async (userId) => {
  try {
    const { data: goals } = await supabase
      .from("fitness_goals")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (goals && goals.length > 0) {
      await awardAchievement(userId, "goal_crusher")
    }

    return true
  } catch (error) {
    console.error("Error checking goal achievements:", error)
    return false
  }
}

/**
 * Check and award achievements when a challenge is completed
 */
export const checkChallengeAchievements = async (userId) => {
  try {
    const { data: challengeMembers } = await supabase
      .from("challenge_members")
      .select("challenge_id, progress, challenges(target)")
      .eq("user_id", userId)

    if (challengeMembers) {
      const completedChallenges = challengeMembers.filter(
        cm => cm.progress >= cm.challenges.target
      )

      if (completedChallenges.length > 0) {
        await awardAchievement(userId, "challenge_winner")
      }
    }

    return true
  } catch (error) {
    console.error("Error checking challenge achievements:", error)
    return false
  }
}

/**
 * Check and award achievements when progress is shared
 */
export const checkProgressShareAchievements = async (userId) => {
  try {
    const { data: shares } = await supabase
      .from("progress_shares")
      .select("id")
      .eq("sharer_id", userId)

    if (shares && shares.length >= 10) {
      await awardAchievement(userId, "social_diva")
    }

    return true
  } catch (error) {
    console.error("Error checking progress share achievements:", error)
    return false
  }
}

/**
 * Check and award achievements for gym saves
 */
export const checkGymAchievements = async (userId) => {
  try {
    const { data: savedGyms } = await supabase
      .from("saved_gyms")
      .select("id")
      .eq("user_id", userId)

    if (savedGyms && savedGyms.length >= 3) {
      await awardAchievement(userId, "explorer")
    }

    return true
  } catch (error) {
    console.error("Error checking gym achievements:", error)
    return false
  }
}

/**
 * Check and award achievements for leaderboard position
 */
export const checkLeaderboardAchievements = async (userId) => {
  try {
    // Get user's current rank
    const { data: leaderboard } = await supabase
      .from("profiles")
      .select("id")
      .order("points", { ascending: false })
      .limit(10)

    if (leaderboard && leaderboard.some(profile => profile.id === userId)) {
      await awardAchievement(userId, "leaderboard_top10")
    }

    return true
  } catch (error) {
    console.error("Error checking leaderboard achievements:", error)
    return false
  }
}

/**
 * Award an achievement to a user (only if not already awarded)
 */
export const awardAchievement = async (userId, badgeType) => {
  try {
    // Check if achievement already exists
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_type", badgeType)
      .single()

    if (existing) {
      console.log(`Achievement already earned: ${badgeType}`)
      return // Badge already awarded
    }

    // Award the badge
    const badge = ACHIEVEMENT_BADGES[badgeType]
    if (!badge) {
      console.error(`Badge not found: ${badgeType}`)
      return
    }

    const { data, error } = await supabase
      .from("achievements")
      .insert([
        {
          user_id: userId,
          badge_type: badgeType,
          points: badge.points,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error("Error inserting achievement:", error)
      throw error
    }

    console.log(`Achievement inserted for ${badgeType}:`, data)

    // Update user's total points in profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      throw profileError
    }

    const newPoints = (profile?.points || 0) + badge.points

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating profile points:", updateError)
      throw updateError
    }

    console.log(`Profile updated: points updated to ${newPoints}`)

    // Emit event to notify UI of update
    window.dispatchEvent(new CustomEvent("achievementsUpdate", { detail: { userId, badgeType } }))

    console.log(`Achievement awarded: ${badgeType} (+${badge.points} points)`)
    return data
  } catch (error) {
    console.error("Error awarding achievement:", error)
    return null
  }
}

/**
 * Get total points for a user
 */
export const getUserPoints = async (userId) => {
  try {
    const { data: achievements } = await supabase
      .from("achievements")
      .select("badge_type")
      .eq("user_id", userId)

    let totalPoints = 0
    if (achievements) {
      totalPoints = achievements.reduce((sum, a) => {
        const badge = ACHIEVEMENT_BADGES[a.badge_type]
        return sum + (badge?.points || 0)
      }, 0)
    }

    return totalPoints
  } catch (error) {
    console.error("Error getting user points:", error)
    return 0
  }
}

/**
 * Get earned badges for a user
 */
export const getUserAchievements = async (userId) => {
  try {
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return achievements || []
  } catch (error) {
    console.error("Error getting user achievements:", error)
    return []
  }
}

/**
 * Check if user has a specific achievement
 */
export const hasAchievement = async (userId, badgeType) => {
  try {
    const { data } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_type", badgeType)
      .single()

    return !!data
  } catch (error) {
    return false
  }
}

/**
 * Check workout streak
 */
const checkWorkoutStreak = (workouts, days) => {
  if (!workouts || workouts.length === 0) return false

  const sortedWorkouts = workouts.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  let streakDays = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const checkDate = new Date(currentDate)
    checkDate.setDate(checkDate.getDate() - i)

    const workoutOnDate = sortedWorkouts.some(w => {
      const workoutDate = new Date(w.created_at)
      workoutDate.setHours(0, 0, 0, 0)
      return workoutDate.getTime() === checkDate.getTime()
    })

    if (workoutOnDate) {
      streakDays++
    } else {
      break
    }
  }

  return streakDays === days
}

/**
 * Check all achievements for a user (comprehensive check)
 */
export const checkAllAchievements = async (userId) => {
  try {
    await checkWorkoutAchievements(userId)
    await checkBuddyAchievements(userId)
    await checkGoalAchievements(userId)
    await checkChallengeAchievements(userId)
    await checkProgressShareAchievements(userId)
    await checkGymAchievements(userId)
    await checkLeaderboardAchievements(userId)

    return true
  } catch (error) {
    console.error("Error checking all achievements:", error)
    return false
  }
}
