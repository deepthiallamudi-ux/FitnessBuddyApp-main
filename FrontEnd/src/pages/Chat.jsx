import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"
import { Send, MessageCircle, Users, X, Search } from "lucide-react"

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  const [receiverId, setReceiverId] = useState("")
  const [receiverName, setReceiverName] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [buddies, setBuddies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Auto-load buddy from navigation state if passed from Buddies page
  useEffect(() => {
    if (location.state?.buddyId) {
      setReceiverId(location.state.buddyId)
      setReceiverName(location.state.buddyName || "")
    }
  }, [location.state])

  const fetchBuddies = async () => {
    try {
      setLoading(true)
      // Dummy buddies for demo purposes
      const dummyBuddies = [
        {
          id: "dummy-1",
          username: "Alex Trainer",
          avatar_url: null,
          isDummy: true
        },
        {
          id: "dummy-2",
          username: "Sarah Runner",
          avatar_url: null,
          isDummy: true
        },
        {
          id: "dummy-3",
          username: "Mike CrossFit",
          avatar_url: null,
          isDummy: true
        }
      ]

      // Fetch connected buddies
      const { data: buddyData } = await supabase
        .from("buddies")
        .select("buddy_id")
        .eq("user_id", user.id)
        .eq("status", "connected")

      if (buddyData && buddyData.length > 0) {
        const buddyIds = buddyData.map(b => b.buddy_id)
        
        // Fetch their profile information
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", buddyIds)

        if (profiles) {
          setBuddies([...dummyBuddies, ...profiles])
        }
      } else {
        // If no connected buddies, show only dummy buddies
        setBuddies(dummyBuddies)
      }
    } catch (error) {
      console.error("Error fetching buddies:", error)
      // Fallback to dummy buddies if there's an error
      const dummyBuddies = [
        {
          id: "dummy-1",
          username: "Alex Trainer",
          avatar_url: null,
          isDummy: true
        },
        {
          id: "dummy-2",
          username: "Sarah Runner",
          avatar_url: null,
          isDummy: true
        },
        {
          id: "dummy-3",
          username: "Mike CrossFit",
          avatar_url: null,
          isDummy: true
        }
      ]
      setBuddies(dummyBuddies)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!receiverId) return

    const selectedBuddy = buddies.find(b => b.id === receiverId)

    // If it's a dummy buddy, load sample messages
    if (selectedBuddy?.isDummy) {
      const sampleMessages = [
        { id: 1, sender_id: receiverId, receiver_id: user.id, message: `Hey! I'm ${selectedBuddy.username}. Let's chat about fitness! 💪`, created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, sender_id: receiverId, receiver_id: user.id, message: "Been working on some great workouts lately. What about you?", created_at: new Date(Date.now() - 1800000).toISOString() }
      ]
      setMessages(sampleMessages)
      return
    }

    try {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })

      if (data) setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBuddies()
    }
  }, [user])

  useEffect(() => {
    fetchMessages()
  }, [receiverId])

  useEffect(() => {
    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        payload => {
          if (
            (payload.new.sender_id === user.id && payload.new.receiver_id === receiverId) ||
            (payload.new.sender_id === receiverId && payload.new.receiver_id === user.id)
          ) {
            setMessages(prev => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [receiverId])

  const sendMessage = async () => {
    if (!message.trim() || !receiverId) return

    try {
      await supabase.from("chat_messages").insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          message: message.trim(),
          read: false,
          created_at: new Date()
        }
      ])

      setMessage("")
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error sending message: " + error.message)
    }
  }

  const selectBuddy = (buddy) => {
    setReceiverId(buddy.id)
    setReceiverName(buddy.username)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-[#E3EED4] to-[#AEC3B0] dark:from-[#0F2A1D] dark:to-[#375534] p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-8">
            💬 Chat with Buddies
          </h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Buddies List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 h-fit"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Connected Buddies
                </h2>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search buddies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-2 focus:ring-accent dark:focus:ring-darkGreen transition"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 rounded-full border-4 border-accent border-t-primary animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading buddies...</p>
                </div>
              ) : buddies.filter(buddy => buddy.username?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {buddies.length === 0 ? "No connected buddies yet. Go to the Buddies page to send requests!" : "No matching buddies"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {buddies
                    .filter(buddy => buddy.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(buddy => (
                    <motion.button
                      key={buddy.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectBuddy(buddy)}
                      className={`w-full p-3 rounded-lg text-left transition ${
                        receiverId === buddy.id
                          ? "bg-gradient-to-r from-primary to-secondary text-light"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {buddy.avatar_url ? (
                          <img
                            src={buddy.avatar_url}
                            alt={buddy.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                            {buddy.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-sm truncate">
                          {buddy.username}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col h-[500px]"
            >
              {receiverId ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {receiverName}
                    </h3>
                    <button
                      onClick={() => {
                        setReceiverId("")
                        setReceiverName("")
                      }}
                      className="text-gray-600 dark:text-gray-400 hover:text-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`flex ${
                            msg.sender_id === user.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.sender_id === user.id
                                ? "bg-gradient-to-r from-primary to-secondary text-light rounded-br-none"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : ""}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-light font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a buddy to start chatting
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

