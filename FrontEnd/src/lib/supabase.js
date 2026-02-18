import { createClient } from "@supabase/supabase-js"

// Custom storage using sessionStorage - expires when browser tab closes
const sessionStorage_storage = {
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.error("Failed to set session storage:", error)
    }
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error("Failed to remove from session storage:", error)
    }
  }
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: sessionStorage_storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// Clear session when browser tab closes
window.addEventListener('beforeunload', async () => {
  // Log out when tab is closed
  await supabase.auth.signOut()
})
