// Haversine Formula (Distance in KM)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in KM

  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function matchUsers(currentUser, users) {
  if (!currentUser) return []

  return users
    .filter((user) => user.id !== currentUser.id) // remove self
    .map((user) => {
      let score = 0
      let distance = null

      // 🎯 Goal match
      if (
        user.goal &&
        currentUser.goal &&
        user.goal.toLowerCase() === currentUser.goal.toLowerCase()
      ) {
        score += 3
      }

      // 🏋 Workout match
      if (
        user.workout &&
        currentUser.workout &&
        user.workout.toLowerCase() ===
          currentUser.workout.toLowerCase()
      ) {
        score += 2
      }

      // 🌍 Distance match
      if (
        user.latitude &&
        user.longitude &&
        currentUser.latitude &&
        currentUser.longitude
      ) {
        distance = calculateDistance(
          currentUser.latitude,
          currentUser.longitude,
          user.latitude,
          user.longitude
        )

        if (distance < 5) score += 4
        else if (distance < 15) score += 2
        else if (distance < 30) score += 1
      }

      return {
        ...user,
        score,
        distance: distance ? distance.toFixed(1) : null,
      }
    })
    .sort((a, b) => b.score - a.score)
}
