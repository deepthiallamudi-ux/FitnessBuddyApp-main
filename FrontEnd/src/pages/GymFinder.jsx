import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { MapPin, Phone, Clock, Star, Filter, Navigation, X, Search } from "lucide-react"
import { checkGymAchievements } from "../utils/achievementUtils"

export default function GymFinder() {
  const { user } = useAuth()
  const [gyms, setGyms] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [filteredGyms, setFilteredGyms] = useState([])
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedGyms, setSavedGyms] = useState([])
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (user) {
      fetchUserLocation()
      fetchGyms()
      fetchSavedGyms()
    }
  }, [user])

  const fetchUserLocation = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("latitude, longitude")
      .eq("id", user.id)
      .single()

    if (data && data.latitude && data.longitude) {
      setUserLocation({ lat: data.latitude, lng: data.longitude })
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    }
  }

  const fetchGyms = async () => {
    setLoading(true)
    try {
      // Mock gym data - in production, this would come from a real API
      const mockGyms = [
        {
          id: 1,
          name: "FitHub Gym",
          type: "Gym",
          address: "123 Main St, Downtown",
          phone: "(555) 123-4567",
          hours: "6am - 10pm",
          rating: 4.5,
          amenities: ["Weights", "Cardio", "Classes", "Pool"],
          distance: 0.5,
          image: "🏋️",
          lat: 40.7128,
          lng: -74.0060
        },
        {
          id: 2,
          name: "Yoga Haven",
          type: "Yoga Studio",
          address: "456 Park Ave",
          phone: "(555) 234-5678",
          hours: "7am - 9pm",
          rating: 4.8,
          amenities: ["Classes", "Mat Space", "Sauna", "Meditation"],
          distance: 1.2,
          image: "🧘",
          lat: 40.7250,
          lng: -74.0100
        },
        {
          id: 3,
          name: "Runner's Track",
          type: "Outdoor Track",
          address: "789 Park Road",
          phone: "(555) 345-6789",
          hours: "24/7",
          rating: 4.6,
          amenities: ["Track", "Trail", "Parking", "Water Fountain"],
          distance: 2.1,
          image: "🏃",
          lat: 40.7300,
          lng: -74.0150
        },
        {
          id: 4,
          name: "CrossFit Elite",
          type: "CrossFit Box",
          address: "321 Industrial Blvd",
          phone: "(555) 456-7890",
          hours: "5am - 9pm",
          rating: 4.7,
          amenities: ["CrossFit", "Coaching", "Classes", "Equipment"],
          distance: 1.8,
          image: "🦾",
          lat: 40.7200,
          lng: -74.0080
        },
        {
          id: 5,
          name: "Spin Cycle Studio",
          type: "Cycling Studio",
          address: "654 Commerce St",
          phone: "(555) 567-8901",
          hours: "6am - 8pm",
          rating: 4.4,
          amenities: ["Spin Classes", "Bikes", "Music", "Showers"],
          distance: 1.5,
          image: "🚴",
          lat: 40.7180,
          lng: -74.0070
        },
        {
          id: 6,
          name: "HydroPool",
          type: "Swimming Pool",
          address: "987 Water Lane",
          phone: "(555) 678-9012",
          hours: "5:30am - 9pm",
          rating: 4.9,
          amenities: ["Lap Lanes", "Classes", "Sauna", "Changing Rooms"],
          distance: 2.8,
          image: "🏊",
          lat: 40.7350,
          lng: -74.0200
        }
      ]

      setGyms(mockGyms)
      setFilteredGyms(mockGyms)
    } catch (error) {
      console.error("Error fetching gyms:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
    if (type === "all") {
      setFilteredGyms(gyms)
    } else {
      setFilteredGyms(gyms.filter(gym => gym.type === type))
    }
  }

  const handleSaveGym = async (gym) => {
    setSaving(true)
    try {
      const { error } = await supabase.from("saved_gyms").insert([
        {
          user_id: user.id,
          gym_id: gym.id,
          gym_name: gym.name,
          gym_address: gym.address,
          created_at: new Date()
        }
      ])

      if (error) {
        alert("Already saved this gym!")
        setSaving(false)
        return
      }

      alert("✓ Gym saved to your favorites!")
      fetchSavedGyms()
      
      // Check for gym achievements
      await checkGymAchievements(user.id)
      
      // Dispatch achievement update event
      window.dispatchEvent(new Event('achievementsUpdate'))
    } catch (error) {
      console.error("Error saving gym:", error)
    } finally {
      setSaving(false)
    }
  }

  const fetchSavedGyms = async () => {
    try {
      const { data } = await supabase
        .from("saved_gyms")
        .select("id, gym_id")
        .eq("user_id", user.id)

      if (data) {
        setSavedGyms(data)
      }
    } catch (error) {
      console.error("Error fetching saved gyms:", error)
    }
  }

  const handleUnsaveGym = async (savedGymRecordId) => {
    try {
      const { error } = await supabase
        .from("saved_gyms")
        .delete()
        .eq("id", savedGymRecordId)

      if (error) {
        alert("Error removing gym: " + error.message)
        return
      }

      alert("✓ Gym removed from favorites")
      fetchSavedGyms()
    } catch (error) {
      console.error("Error unsaving gym:", error)
      alert("Error: " + error.message)
    }
  }

  const getSavedGymRecord = (gymId) => {
    return savedGyms.find(g => g.gym_id === gymId)
  }

  const checkIsSaved = (gymId) => {
    return savedGyms.some(g => g.gym_id === gymId)
  }

  const gymTypes = ["all", "Gym", "Yoga Studio", "Outdoor Track", "CrossFit Box", "Cycling Studio", "Swimming Pool"]

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            🏢 Find Fitness Venues
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover gyms, studios, and fitness venues near you
          </p>
        </div>

        {/* Location Info */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg flex items-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </motion.div>
        )}

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filter by Type</h2>
          </div>
          <div className="flex gap-2 flex-wrap mb-6">
            {gymTypes.map(type => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange(type)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  filterType === type
                    ? "bg-gradient-to-r from-primary to-secondary text-light"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {type === "all" ? "All Types" : type}
              </motion.button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gyms by name, address, or amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
            />
          </div>
        </div>

        {/* Gyms Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 rounded-full border-4 border-accent border-t-primary animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Finding nearby venues...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms
              .filter(gym => {
                const searchLower = searchQuery.toLowerCase()
                return (
                  gym.name?.toLowerCase().includes(searchLower) ||
                  gym.address?.toLowerCase().includes(searchLower) ||
                  gym.amenities?.some(a => a.toLowerCase().includes(searchLower)) ||
                  gym.type?.toLowerCase().includes(searchLower)
                )
              })
              .length > 0 ? (
              filteredGyms
                .filter(gym => {
                  const searchLower = searchQuery.toLowerCase()
                  return (
                    gym.name?.toLowerCase().includes(searchLower) ||
                    gym.address?.toLowerCase().includes(searchLower) ||
                    gym.amenities?.some(a => a.toLowerCase().includes(searchLower)) ||
                    gym.type?.toLowerCase().includes(searchLower)
                  )
                })
                .map((gym, index) => (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition"
                >
                  {/* Icon and Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-5xl mb-2">{gym.image}</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {gym.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold text-secondary dark:text-darkGreen">
                        {gym.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-yellow-700 dark:text-yellow-200">{gym.rating}</span>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-3 mb-4 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-secondary dark:text-darkGreen flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{gym.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <a href={`tel:${gym.phone}`} className="font-semibold text-blue-600 dark:text-blue-400 text-sm hover:underline">
                          {gym.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hours</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{gym.hours}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Navigation className="w-5 h-5 text-accent dark:text-[#AEC3B0] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{gym.distance} km away</p>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {gym.amenities.map(amenity => (
                        <span
                          key={amenity}
                          className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(gym.name + " " + gym.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-secondary text-light font-semibold rounded-lg hover:bg-darkGreen transition text-center text-sm"
                    >
                      🗺️ Directions
                    </a>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault()
                        if (checkIsSaved(gym.id)) {
                          const record = getSavedGymRecord(gym.id)
                          if (record) handleUnsaveGym(record.id)
                        } else {
                          handleSaveGym(gym)
                        }
                      }}
                      className={`flex-1 py-2 font-semibold rounded-lg transition text-sm flex items-center justify-center gap-2 ${
                        checkIsSaved(gym.id)
                          ? "bg-red-500 text-light hover:bg-red-600 shadow-md"
                          : "bg-gradient-to-r from-primary to-secondary text-light hover:shadow-lg"
                      }`}
                    >
                      {checkIsSaved(gym.id) ? (
                        <>
                          <X className="w-4 h-4" /> Unsave
                        </>
                      ) : (
                        <>❤️ Save</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No venues found for this filter type
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-orange-100 dark:bg-orange-900 rounded-2xl text-orange-800 dark:text-orange-200"
        >
          <h3 className="font-bold mb-2">💡 Pro Tip</h3>
          <p>
            Join a local gym or class to meet other fitness enthusiasts! Many venues offer trial classes and introductory offers. 
            Save your favorite gyms to quickly find them later, and invite your fitness buddies to join you!
          </p>
        </motion.div>
      </motion.div>
    </div>
    </PageTransition>
  )
}
