import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../context/AuthContext"
import PageTransition from "../components/PageTransition"

export default function Chat() {
  const { user } = useAuth()
  const [receiverId, setReceiverId] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])

  const fetchMessages = async () => {
    if (!receiverId) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),
         and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true })

    if (data) setMessages(data)
  }

  useEffect(() => {
    fetchMessages()
  }, [receiverId])

  useEffect(() => {
    const channel = supabase
      .channel("realtime messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        payload => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const sendMessage = async () => {
    if (!message || !receiverId) return

    await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: receiverId,
        content: message
      }
    ])

    setMessage("")
  }

  return (
    <PageTransition>
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        Chat
      </h1>

      <input
        className="w-full p-2 mb-3 rounded bg-gray-200 dark:bg-gray-800"
        placeholder="Enter Receiver User ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />

      <div className="bg-white dark:bg-gray-900 h-64 overflow-y-auto p-4 rounded mb-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.sender_id === user.id
                ? "text-right"
                : "text-left"
            }`}
          >
            <span className="bg-secondary px-3 py-1 rounded inline-block">
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 p-2 rounded-l bg-gray-200 dark:bg-gray-800"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
    </PageTransition>
  )
}
