"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

type Theme = "dark-purple" | "classic-black" | "emerald-stoic" | "royal-gold"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  unlockedThemes: string[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser()
  const [theme, setThemeState] = useState<Theme>("dark-purple")
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["dark-purple", "classic-black"])

  useEffect(() => {
    if (isSignedIn && user?.username) {
      const apiUrl = `/api/user/profile?username=${encodeURIComponent(user.username)}`
      fetch(apiUrl)
        .then(async res => {
          const contentType = res.headers.get("content-type")
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            const text = await res.text()
            console.error(`[DEBUG] Theme API Error (${res.status}):`, text.substring(0, 100))
            throw new Error(`Non-JSON response or error: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.user) {
            setThemeState(data.user.activeTheme || "dark-purple")
            setUnlockedThemes(data.user.unlockedThemes || ["dark-purple", "classic-black"])
          }
        })
        .catch(err => console.error("Failed to fetch theme settings:", err))
    }
  }, [isSignedIn, user?.username])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    document.documentElement.className = newTheme
    if (isSignedIn) {
      await fetch("/api/user/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: newTheme }),
      })
    }
  }

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, unlockedThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
