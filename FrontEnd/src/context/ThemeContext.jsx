import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [dark, setDarkState] = useState(() => {
    // Check localStorage on first load
    const saved = localStorage.getItem("darkMode")
    if (saved !== null) {
      return saved === "true"
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  const setDark = (value) => {
    const newValue = typeof value === "function" ? value(dark) : value
    setDarkState(newValue)
    localStorage.setItem("darkMode", String(newValue))
  }

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
