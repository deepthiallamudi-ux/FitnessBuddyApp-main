import { motion } from "framer-motion"
import { useState } from "react"
import PageTransition from "../components/PageTransition"
import { Search } from "lucide-react"

const resources = [
  {
    id: 1,
    title: "Full Body HIIT Workout",
    category: "HIIT",
    url: "https://www.youtube.com/embed/ml6cT4AZdqI"
  },
  {
    id: 2,
    title: "Morning Yoga Flow",
    category: "Yoga",
    url: "https://www.youtube.com/embed/v7AYKMP6rOE"
  },
  {
    id: 3,
    title: "Beginner Running Tips",
    category: "Running",
    url: "https://www.youtube.com/embed/brFHyOtTwH4"
  }
]

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", ...new Set(resources.map(r => r.category))]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
            📚 Workout Resources & Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore tutorials, guides, and workout videos to improve your fitness
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-secondary text-light"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category === "all" ? "All" : category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden"
              >
                <iframe
                  className="w-full h-48"
                  src={item.url}
                  title={item.title}
                  allowFullScreen
                />

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm px-3 py-1 bg-primary/20 text-primary dark:text-secondary rounded-full font-semibold">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No resources found matching your search
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </PageTransition>
  )
}
