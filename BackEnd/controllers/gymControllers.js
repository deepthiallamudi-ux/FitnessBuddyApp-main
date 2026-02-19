import axios from "axios"

export const getGyms = async (req, res) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude required" })
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY not configured, returning mock data")
      return res.json([
        {
          id: 1,
          name: "FitHub Gym",
          address: "123 Main St, Downtown",
          phone: "(555) 123-4567",
          rating: 4.5,
          distance: 0.5
        },
        {
          id: 2,
          name: "Yoga Haven",
          address: "456 Park Ave",
          phone: "(555) 234-5678",
          rating: 4.8,
          distance: 1.2
        }
      ])
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 3000,
          type: "gym",
          key: process.env.GOOGLE_API_KEY
        }
      }
    )

    res.json(response.data.results || [])
  } catch (error) {
    console.error("Error fetching gyms:", error.message)
    res.status(500).json({ error: "Failed to fetch gyms" })
  }
}

export const getGymsWithType = async (req, res) => {
  try {
    const { lat, lng, type } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude required" })
    }

    const typeMap = {
      gym: "gym",
      yoga: "yoga",
      track: "park",
      crossfit: "fitness",
      cycling: "bicycle_store",
      swimming: "swimming_pool"
    }

    const searchType = typeMap[type] || "gym"

    if (!process.env.GOOGLE_API_KEY) {
      return res.json([])
    }

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 3000,
          type: searchType,
          key: process.env.GOOGLE_API_KEY
        }
      }
    )

    res.json(response.data.results || [])
  } catch (error) {
    console.error("Error fetching gyms by type:", error.message)
    res.status(500).json({ error: "Failed to fetch gyms" })
  }
}
