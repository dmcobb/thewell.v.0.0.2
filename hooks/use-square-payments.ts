import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { SQIPCore, SQIPCardEntry } from 'react-native-square-in-app-payments'
import { getSquareConfig } from '@/lib/config/square'

interface SquareCardDetails {
  nonce: string;
  card: {
    brand: string;
    lastFourDigits: string;
    expirationMonth?: number;
    expirationYear?: number;
    postalCode?: string;
    prepaidType?: string
    type?: string
  };
  token?: string
}

interface SquareErrorInfo {
  code: string;
  message: string;
  debugCode?: string;
  debugMessage?: string;
}

interface CardEntryConfig {
  collectPostalCode?: boolean;
}

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

      if (Platform.OS === 'ios') {
        await SQIPCardEntry.setIOSCardEntryTheme({
          saveButtonTitle: 'Continue',
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Square payments'
      setError(errorMessage)
      console.error('[Anointed Innovations] Square initialization error:', err)
    }
  }, [])

  // FOR SUBSCRIPTIONS: Use startCardEntryFlow with 'Store' (default behavior)
  const startCardEntry = useCallback(
    async (
      onCardNonceRequestSuccess: (cardDetails: SquareCardDetails) => void,
      onCardEntryCancel: () => void,
    ): Promise<void> => {
      try {
        if (!isInitialized) {
          throw new Error('Square payments not initialized')
        }

        const cardEntryConfig: CardEntryConfig = {
          collectPostalCode: true, // Required for US/Canada/UK
        }

        console.log('[Anointed Innovations] Starting card entry for subscription (card on file)')

        // Use standard card entry flow for storing cards
        await (SQIPCardEntry as any).startCardEntryFlow(
          cardEntryConfig,
          async (cardDetails: SquareCardDetails) => {
            try {
              console.log('[Anointed Innovations] Card nonce received:', {
                nonce: cardDetails.nonce?.substring(0, 20) + '...',
                card: cardDetails.card
              })
              
              if (!cardDetails.nonce) {
                throw new Error('No nonce returned from card entry')
              }
              
              // Pass the card details to create a customer card
              onCardNonceRequestSuccess(cardDetails)
              
              // Close the card entry form
              await SQIPCardEntry.completeCardEntry(() => {
                console.log('[Anointed Innovations] Card entry closed successfully')
              })
            } catch (error) {
              console.error('[Anointed Innovations] Error processing card:', error)
              const errorMessage = error instanceof Error ? error.message : 'Failed to process card'
              await SQIPCardEntry.showCardNonceProcessingError(errorMessage)
            }
          },
          async () => {
            console.warn('[Anointed Innovations] Card entry cancelled by user')
            onCardEntryCancel()
          }
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start card entry'
        setError(errorMessage)
        console.error('[Anointed Innovations] Card entry error:', err)
        onCardEntryCancel()
      }
    },
    [isInitialized],
  )

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