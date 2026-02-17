import { motion } from "framer-motion"
import PageTransition from "../components/PageTransition"

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
  return (
    <PageTransition>
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">
        Workout Resources
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
          >
            <iframe
              className="w-full h-48"
              src={item.url}
              title={item.title}
              allowFullScreen
            />

            <div className="p-4">
              <h3 className="font-bold text-lg">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500">
                Category: {item.category}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}
