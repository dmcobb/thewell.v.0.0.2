import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../lib/services/auth.service"
import { useRouter, useSegments } from "expo-router"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === "auth"
    const inOnboarding = segments[0] === "onboarding"
    const inStartJourney = segments[0] === "start-journey"
    const inTabs = segments[0] === "(tabs)"

    if (!user && !inAuthGroup) {
      // Not authenticated and not in auth screens - redirect to splash
      router.replace("/")
    } else if (user) {
      // User is authenticated - check profile completion
      if (!user.profileComplete && !inOnboarding && !inStartJourney) {
        // Profile not complete - redirect to onboarding
        router.replace("/onboarding")
      } else if (user.profileComplete && !inTabs) {
        // Profile complete - redirect to main app
        router.replace("/(tabs)")
      }
    }
  }, [user, segments, isLoading])

  const loadUser = async () => {
    try {
      const isAuth = await authService.isAuthenticated()
      if (isAuth) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error("[v0] Error loading user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
    } catch (error) {
      console.error("[v0] Login error:", error)
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      const response = await authService.register(data)
      setUser(response.user)
    } catch (error) {
      console.error("[v0] Register error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.replace("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
