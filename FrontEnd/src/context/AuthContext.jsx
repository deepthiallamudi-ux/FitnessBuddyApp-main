import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )
    

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
  try {
    // First try standard signup
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {}
      }
    })
    
    if (error) {
      console.error("SignUp Error:", error)
      return { data: null, error }
    }
    
    // If signup successful, check if user is already authenticated
    // If email confirmation is disabled in Supabase, session is immediate
    // If email confirmation is enabled, user needs email verification
    const { data: sessionData } = await supabase.auth.getSession()
    
    console.log("SignUp Success:", data)
    console.log("Session after signup:", sessionData)
    
    return { data, error: null }
  } catch (err) {
    console.error("SignUp Exception:", err)
    return { data: null, error: err }
  }
}

const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
    if (error) {
      return { data: null, error }
    }
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: "google" })

  const signInWithFacebook = () =>
    supabase.auth.signInWithOAuth({ provider: "facebook" })

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset"
    })

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
