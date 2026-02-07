import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface PaymentIntent {
  payment_id: string
  amount: number
  currency: string
  status: string
}

export interface SquarePaymentResult {
  success: boolean
  payment_id?: string
  subscription_id?: string
  error?: string
}

class PaymentService {
  async createPaymentIntent(planId: string): Promise<PaymentIntent> {
    const response = await apiClient.post<PaymentIntent>(API_ENDPOINTS.PAYMENTS.CREATE_INTENT, {
      plan_id: planId,
    })
    return response
  }

  async processPayment(planId: string, nonce: string): Promise<SquarePaymentResult> {
    const response = await apiClient.post<SquarePaymentResult>(API_ENDPOINTS.PAYMENTS.PROCESS, {
      plan_id: planId,
      source_id: nonce,
    })
    return response
  }

  async verifyPayment(paymentId: string): Promise<{ verified: boolean; subscription_id?: string }> {
    const response = await apiClient.get<{ verified: boolean; subscription_id?: string }>(
      API_ENDPOINTS.PAYMENTS.VERIFY(paymentId),
    )
    return response
  }
}

export const paymentService = new PaymentService()