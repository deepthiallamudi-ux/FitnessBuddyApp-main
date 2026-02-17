import axios from "axios"

export const getGyms = async (req, res) => {
  const { lat, lng } = req.query

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

  res.json(response.data.results)
}
