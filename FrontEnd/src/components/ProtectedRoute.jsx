import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // While loading auth state, show nothing (or a loader if you want)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-light via-accent to-secondary">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-light"></div>
          <p className="mt-4 text-primary font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user and auth is done loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
