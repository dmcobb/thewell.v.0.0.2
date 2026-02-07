import { useCallback, useState } from "react"
import { SQIPCore, SQIPCardEntry } from "react-native-square-in-app-payments"
import { getSquareConfig } from "@/lib/config/square"

export function useSquarePayments() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayments = useCallback(async () => {
    try {
      const squareConfig = getSquareConfig()

      if (!squareConfig) {
        throw new Error("Square configuration not available")
      }

      await SQIPCore.setSquareApplicationId(squareConfig.applicationId)
      setIsInitialized(true)
      setError(null)
      console.log("[Anointed Innovations] Square Mobile Payments SDK initialized")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize Square payments"
      setError(errorMessage)
      console.error("[Anointed Innovations] Square initialization error:", err)
    }
  }, [])

  const startCardEntry = useCallback(
    (
      onCardNonceRequestSuccess: (cardDetails: any) => void,
      onCardEntryCancel: () => void
    ): void => {
      try {
        if (!isInitialized) {
          throw new Error("Square payments not initialized")
        }

        console.log("[Anointed Innovations] Starting card entry flow")

        const cardEntryConfig = {
          collectPostalCode: false,
        }

        SQIPCardEntry.startCardEntryFlow(
          cardEntryConfig,
          onCardNonceRequestSuccess,
          onCardEntryCancel
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to start card entry"
        setError(errorMessage)
        console.error("[Anointed Innovations] Card entry error:", err)
      }
    },
    [isInitialized]
  )

  return {
    isInitialized,
    error,
    initializePayments,
    startCardEntry,
  }
}