import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { authService } from "../lib/services/auth.service"
import { useRouter, useSegments } from "expo-router"

interface AuthContextType {
  user: any | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  onboardingProgress: any | null
  loadOnboardingProgress: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<any | null>(null)
  const router = useRouter()
  const segments = useSegments()
  const isNavigating = useRef(false)

  useEffect(() => {
    console.log("[Anointed Innovations] AuthProvider mounted, loading user...")
    loadUser()
  }, [])

  useEffect(() => {
    console.log("[Anointed Innovations] Segments changed:", segments)
    console.log("[Anointed Innovations] isLoading:", isLoading, "user:", user)

    if (isLoading) return

    if (isNavigating.current) {
      console.log("[Anointed Innovations] Navigation already in progress, skipping")
      return
    }

    const inAuthGroup = segments[0] === "auth"
    const inOnboarding = segments[0] === "onboarding"
    const inStartJourney = segments[0] === "start-journey"
    const inTabs = segments[0] === "(tabs)"
    const inIndex = !inAuthGroup && !inOnboarding && !inStartJourney && !inTabs

    console.log(
      "[Anointed Innovations] Navigation check - inAuthGroup:",
      inAuthGroup,
      "inOnboarding:",
      inOnboarding,
      "inTabs:",
      inTabs,
      "inIndex:",
      inIndex,
    )

    if (!user && !inAuthGroup && !inIndex) {
      console.log("[Anointed Innovations] No user and not in auth - redirecting to splash")
      isNavigating.current = true
      router.replace("/")
      setTimeout(() => {
        isNavigating.current = false
      }, 500)
    } else if (user) {
      console.log("[Anointed Innovations] User exists, profileComplete:", user.profileComplete)
      if (!user.profileComplete && !inOnboarding && !inStartJourney) {
        console.log("[Anointed Innovations] Profile incomplete - redirecting to onboarding")
        isNavigating.current = true
        router.replace("/onboarding")
        setTimeout(() => {
          isNavigating.current = false
        }, 500)
      } else if (user.profileComplete && !inTabs) {
        console.log("[Anointed Innovations] Profile complete - redirecting to tabs")
        isNavigating.current = true
        router.replace("/(tabs)")
        setTimeout(() => {
          isNavigating.current = false
        }, 500)
      }
    }
  }, [user, segments, isLoading])

  const loadUser = async () => {
    try {
      console.log("[Anointed Innovations] Checking if user is authenticated...")
      const isAuth = await authService.isAuthenticated()
      console.log("[Anointed Innovations] isAuthenticated result:", isAuth)

      if (isAuth) {
        console.log("[Anointed Innovations] User is authenticated, fetching current user...")
        const currentUser = await authService.getCurrentUser()
        console.log("[Anointed Innovations] Current user loaded:", currentUser)
        setUser(currentUser)

        if (!currentUser.profileComplete) {
          await loadOnboardingProgress()
        }
      } else {
        console.log("[Anointed Innovations] User is not authenticated")
      }
    } catch (error: any) {
      console.error("[Anointed Innovations] Error loading user:", error)
      if (error.message?.includes("timeout") || error.message?.includes("Network")) {
        console.warn("[Anointed Innovations] Backend unreachable - user will need to login")
      }
    } finally {
      console.log("[Anointed Innovations] Setting isLoading to false")
      setIsLoading(false)
    }
  }

  const loadOnboardingProgress = async () => {
    try {
      const { userService } = await import("../lib/services/user.service")
      const progress = await userService.getOnboardingProgress()
      if (progress) {
        console.log("[Anointed Innovations] Loaded onboarding progress:", progress)
        setOnboardingProgress(progress)
      } else {
        console.log("[Anointed Innovations] No saved onboarding progress - starting from beginning")
        setOnboardingProgress(null)
      }
    } catch (error: any) {
      console.log("[Anointed Innovations] Could not load onboarding progress - starting from beginning")
      setOnboardingProgress(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[Anointed Innovations] Login attempt with email:", email)
      const response = await authService.login({ email, password })
      console.log("[Anointed Innovations] Login response:", JSON.stringify(response, null, 2))
      console.log("[Anointed Innovations] User object:", JSON.stringify(response.user, null, 2))
      console.log("[Anointed Innovations] Setting user state...")
      setUser(response.user)

      if (!response.user.profileComplete) {
        await loadOnboardingProgress()
      }

      console.log("[Anointed Innovations] User state set, navigation should trigger")
    } catch (error) {
      console.error("[Anointed Innovations] Login error:", error)
      throw error
    }
  }

  const register = async (data: any) => {
    try {
      const response = await authService.register(data)
      setUser(response.user)
    } catch (error) {
      console.error("[Anointed Innovations] Register error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      isNavigating.current = false
      await authService.logout()
      setUser(null)
      setOnboardingProgress(null)
      setTimeout(() => {
        router.replace("/")
      }, 100)
    } catch (error) {
      console.error("[Anointed Innovations] Logout error:", error)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      console.log("[Anointed Innovations] Refreshing user data...")
      const currentUser = await authService.getCurrentUser()
      console.log("[Anointed Innovations] User refreshed:", currentUser)
      setUser(currentUser)
    } catch (error) {
      console.error("[Anointed Innovations] Error refreshing user:", error)
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
        refreshUser,
        onboardingProgress,
        loadOnboardingProgress,
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