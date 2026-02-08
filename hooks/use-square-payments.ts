// use-square-payments.ts
import { useCallback, useState } from 'react'
import { Platform } from 'react-native'
import { SQIPCore, SQIPCardEntry } from 'react-native-square-in-app-payments'
import { getSquareConfig } from '@/lib/config/square'

export function useSquarePayments() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePayments = useCallback(async () => {
    try {
      const squareConfig = getSquareConfig()

      if (!squareConfig) {
        throw new Error('Square configuration not available')
      }

      await SQIPCore.setSquareApplicationId(squareConfig.applicationId)

      // Set iOS theme for The Well App branding
      if (Platform.OS === 'ios') {
        await SQIPCardEntry.setIOSCardEntryTheme({
          saveButtonTitle: 'Pay Now',
          saveButtonFont: {
            size: 18,
          },
          saveButtonTextColor: {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0,
          },
          backgroundColor: {
            r: 250,
            g: 250,
            b: 255,
            a: 1.0,
          },
          keyboardAppearance: 'Light',
        })
      }

      setIsInitialized(true)
      setError(null)
      console.log('[Anointed Innovations] Square Mobile Payments SDK initialized')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Square payments'
      setError(errorMessage)
      console.error('[Anointed Innovations] Square initialization error:', err)
    }
  }, [])

  const startCardEntry = useCallback(
    async (
      planData: { name: string; price_total: number; duration_months: number },
      onCardNonceRequestSuccess: (cardDetails: any) => void,
      onCardEntryCancel: () => void,
    ): Promise<void> => {
      try {
        if (!isInitialized) {
          throw new Error('Square payments not initialized')
        }

        console.log('[Anointed Innovations] Starting card entry flow with plan:', planData)

        // Convert total price to cents for Square
        const amountInCents = Math.round(planData.price_total * 100)

        const cardEntryConfig = {
          collectPostalCode: false,
          amount: amountInCents,
          currencyCode: 'USD' as const,
          buyerAction: 'Charge' as const,
        }

        // Wrap the success callback to close the card entry
        const wrappedSuccessCallback = async (cardDetails: any) => {
          console.log('[Anointed Innovations] Card nonce received, closing card entry')
          
          try {
            // IMPORTANT: Close the card entry modal FIRST
            await SQIPCardEntry.completeCardEntry(() => {
              console.log('[Anointed Innovations] Card entry closed successfully')
            })
            
            // Now call the original success callback
            onCardNonceRequestSuccess(cardDetails)
          } catch (closeError) {
            console.error('[Anointed Innovations] Error closing card entry:', closeError)
            // Still call success even if close fails
            onCardNonceRequestSuccess(cardDetails)
          }
        }

        // Wrap the cancel callback
        const wrappedCancelCallback = async () => {
          console.log('[Anointed Innovations] Card entry cancelled by user')
          try {
            await SQIPCardEntry.completeCardEntry(() => {
              console.log('[Anointed Innovations] Card entry closed after cancel')
            })
          } catch (closeError) {
            console.error('[Anointed Innovations] Error closing card entry after cancel:', closeError)
          } finally {
            onCardEntryCancel()
          }
        }

        // Start the card entry flow
        SQIPCardEntry.startCardEntryFlow(
          cardEntryConfig,
          wrappedSuccessCallback,
          wrappedCancelCallback
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start card entry'
        setError(errorMessage)
        console.error('[Anointed Innovations] Card entry error:', err)
      }
    },
    [isInitialized],
  )

  // Add a method to manually close card entry if needed
  const closeCardEntry = useCallback(async () => {
    try {
      await SQIPCardEntry.completeCardEntry(() => {
        console.log('[Anointed Innovations] Card entry closed manually')
      })
    } catch (err) {
      console.error('[Anointed Innovations] Error closing card entry:', err)
    }
  }, [])

  return {
    isInitialized,
    error,
    initializePayments,
    startCardEntry,
    closeCardEntry,
  }
}