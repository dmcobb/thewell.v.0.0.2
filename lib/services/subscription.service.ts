import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface SubscriptionPlan {
  id: string
  name: string
  price_monthly: number
  price_total: number
  duration_months: number
  features: {
    ai_matches: boolean
    unlimited_likes: boolean
    chat: boolean
    browse: boolean
    ad_free: boolean
  }
}

export interface UserSubscription {
  id: string
  plan_id: string
  plan_name: string
  status: string
  started_at: string
  expires_at: string
  has_used_trial: boolean
  features: any
  price_monthly: number
}

export interface SubscriptionStatus {
  subscription: UserSubscription | null
  has_used_trial: boolean
  is_premium: boolean
}

export interface DailyLikeStatus {
  can_like: boolean
  likes_remaining: number
  is_premium: boolean
}

export interface PaymentResult {
  success: boolean
  message: string
  payment_id?: string
  expires_at?: string
}

export interface SquareCardDetails {
  nonce: string;
  card: {
    brand: string;
    lastFourDigits: string;
    expirationMonth?: number;
    expirationYear?: number;
    postalCode?: string;  // Make sure this is defined
    prepaidType?: string;
    type?: string;
  };
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<{ success: boolean; data: SubscriptionPlan[] }>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_PLANS,
    )
    return response.data
  }

  async getUserSubscription(): Promise<SubscriptionStatus> {
    const response = await apiClient.get<{ success: boolean; data: SubscriptionStatus }>(
      API_ENDPOINTS.SUBSCRIPTIONS.GET_SUBSCRIPTION,
    )
    return response.data
  }

  async activateTrial(): Promise<{ success: boolean; message: string; expires_at: string }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.ACTIVATE_TRIAL, {})
  }

  async checkDailyLikeLimit(): Promise<DailyLikeStatus> {
    const response = await apiClient.get<{ success: boolean; data: DailyLikeStatus }>(
      API_ENDPOINTS.SUBSCRIPTIONS.CHECK_DAILY_LIKES,
    )
    return response.data
  }

  async incrementDailyLikes(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.INCREMENT_DAILY_LIKES, {})
  }

  async processPayment(planId: string, nonce: string, postalCode?: string): Promise<PaymentResult> {
    console.log("[Anointed Innovations] 🔥🔥🔥 SUBSCRIPTION-SERVICE-2026-02-12 🔥🔥🔥", { 
    planId, 
    nonceLength: nonce?.length || 0,
    noncePrefix: nonce?.substring(0, 10),
    postalCode
  });
    console.log("[Anointed Innovations] processPayment: Sending nonce to backend", { planId, nonceLength: nonce?.length || 0 })
    
    if (!nonce) {
      throw new Error("Payment nonce is required")
    }

    const response = await apiClient.post<PaymentResult>(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PAYMENT, {
      plan_id: planId,
      source_id: nonce,
      postal_code: postalCode
    })
    
    console.log("[Anointed Innovations] processPayment: Response received", response)
    console.log("[Anointed Innovations] 🔥🔥🔥 SUBSCRIPTION-SERVICE-RESPONSE-2026-02-12 🔥🔥🔥", response)
    return response
  }

  async verifyPayment(paymentId: string): Promise<{ verified: boolean; subscription: any }> {
    const response = await apiClient.get<{ success: boolean; verified: boolean; subscription: any }>(
      API_ENDPOINTS.SUBSCRIPTIONS.VERIFY_PAYMENT(paymentId),
    )
    return { verified: response.verified, subscription: response.subscription }
  }

  // External checkout for Apple Guideline 3.1.1 compliance
  async createCheckoutSession(planId: string): Promise<{
    success: boolean
    data: {
      session_token: string
      checkout_url: string
      plan: {
        id: string
        name: string
        amount: number
        duration_months: number
      }
      expires_at: string
    }
  }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_CHECKOUT_SESSION, {
      plan_id: planId,
    })
  }

  async verifyExternalPayment(sessionToken: string): Promise<{
    success: boolean
    message: string
    data?: {
      subscription_id: string
      plan_type: string
      expires_at: string
    }
  }> {
    return apiClient.post(API_ENDPOINTS.SUBSCRIPTIONS.VERIFY_EXTERNAL_PAYMENT, {
      session_token: sessionToken,
    })
  }

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CANCEL_SUBSCRIPTION, {})
  }

  async getLatestTransaction(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      API_ENDPOINTS.TRANSACTIONS.LATEST,
    )
    return response.data
  }

  async hasAdFreeSubscription(): Promise<boolean> {
    try {
      const subscriptionStatus = await this.getUserSubscription()
      return subscriptionStatus.subscription?.features?.ad_free || false
    } catch (error) {
      console.error('[SubscriptionService] Error checking ad-free status:', error)
      return false
    }
  }
}

export const subscriptionService = new SubscriptionService()