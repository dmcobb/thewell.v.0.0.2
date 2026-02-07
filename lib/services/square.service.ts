import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"
import { getSquareConfig } from "../config/square"

export async function getSquareEnvironment() {
  const config = getSquareConfig()
  if (!config) {
    throw new Error("Square configuration not available")
  }
  return config
}

export async function processPayment(
  planId: string,
  sourceId: string
): Promise<{ success: boolean; message: string; payment_id?: string; expires_at?: string }> {
  const response = await apiClient.post<{
    success: boolean
    message: string
    payment_id?: string
    expires_at?: string
  }>(
    API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
    {
      plan_id: planId,
      source_id: sourceId,
    },
    { requiresAuth: true }
  )
  return response
}

export async function confirmPayment(paymentId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    API_ENDPOINTS.PAYMENTS.PROCESS,
    { payment_id: paymentId },
    { requiresAuth: true }
  )
  return response
}

export async function getPaymentHistory(): Promise<{
  success: boolean
  data: { transactions: any[]; total: number; page: number; limit: number }
}> {
  const response = await apiClient.get<{
    success: boolean
    data: { transactions: any[]; total: number; page: number; limit: number }
  }>(API_ENDPOINTS.PAYMENTS.HISTORY, { requiresAuth: true })
  return response
}
