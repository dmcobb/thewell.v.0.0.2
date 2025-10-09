// Get API URL from environment or use default
export const API_URL = process.env.API_URL || "http://localhost:5000"
export const API_VERSION = process.env.API_VERSION || "v1"
export const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000"

// Build full API base URL
export const API_BASE_URL = `${API_URL}/api/${API_VERSION}`

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    UPLOAD_PHOTOS: `${API_BASE_URL}/users/photos`,
    DELETE_PHOTO: (photoId: string) => `${API_BASE_URL}/users/photos/${photoId}`,
    SET_PRIMARY_PHOTO: (photoId: string) => `${API_BASE_URL}/users/photos/${photoId}/primary`,
    GET_USER: (userId: string) => `${API_BASE_URL}/users/${userId}`,
    SUBMIT_QUESTIONNAIRE: `${API_BASE_URL}/users/questionnaire`,
    GET_QUESTIONNAIRE: `${API_BASE_URL}/users/questionnaire`,
    PREFERENCES: `${API_BASE_URL}/users/preferences`,
    UPDATE_PREFERENCES: `${API_BASE_URL}/users/preferences`,
    DEACTIVATE: `${API_BASE_URL}/users/deactivate`,
    DELETE: `${API_BASE_URL}/users/delete`,
  },
  // Matches
  MATCHES: {
    DISCOVER: `${API_BASE_URL}/matches/discover`,
    GET_MATCHES: `${API_BASE_URL}/matches`,
    GET_MATCH: (id: string) => `${API_BASE_URL}/matches/${id}`,
    LIKE: (userId: string) => `${API_BASE_URL}/matches/like/${userId}`,
    PASS: (userId: string) => `${API_BASE_URL}/matches/pass/${userId}`,
    UNMATCH: (matchId: string) => `${API_BASE_URL}/matches/${matchId}`,
  },
  // Messages
  MESSAGES: {
    GET_CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    GET_MESSAGES: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}`,
    SEND_MESSAGE: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}`,
    SEND_MEDIA: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}/media`,
    MARK_READ: (conversationId: string) => `${API_BASE_URL}/messages/${conversationId}/read`,
    DELETE_MESSAGE: (messageId: string) => `${API_BASE_URL}/messages/${messageId}`,
  },
  // Media
  MEDIA: {
    UPLOAD: `${API_BASE_URL}/media/upload`,
    DELETE: (id: string) => `${API_BASE_URL}/media/${id}`,
  },
  // Prayers
  PRAYERS: {
    GET_PRAYERS: `${API_BASE_URL}/prayers`,
    GET_MY_PRAYERS: `${API_BASE_URL}/prayers/my-requests`,
    CREATE_PRAYER: `${API_BASE_URL}/prayers`,
    UPDATE_PRAYER: (requestId: string) => `${API_BASE_URL}/prayers/${requestId}`,
    DELETE_PRAYER: (requestId: string) => `${API_BASE_URL}/prayers/${requestId}`,
    PRAY_FOR: (requestId: string) => `${API_BASE_URL}/prayers/${requestId}/pray`,
  },
  // Events
  EVENTS: {
    GET_EVENTS: `${API_BASE_URL}/events`,
    GET_EVENT: (id: string) => `${API_BASE_URL}/events/${id}`,
    CREATE_EVENT: `${API_BASE_URL}/events`,
    RSVP: (id: string) => `${API_BASE_URL}/events/${id}/rsvp`,
  },
  // Verification
  VERIFICATION: {
    REQUEST: `${API_BASE_URL}/verification/request`,
    STATUS: `${API_BASE_URL}/verification/status`,
  },
  // Analytics
  ANALYTICS: {
    TRACK_EVENT: `${API_BASE_URL}/analytics/event`,
    GET_STATS: `${API_BASE_URL}/analytics/stats`,
  },
  // Payments
  PAYMENTS: {
    CREATE_SUBSCRIPTION: `${API_BASE_URL}/payments/subscription`,
    CANCEL_SUBSCRIPTION: `${API_BASE_URL}/payments/subscription/cancel`,
    GET_PAYMENT_METHODS: `${API_BASE_URL}/payments/methods`,
  },
  // Ads
  ADS: {
    GET_ADS: `${API_BASE_URL}/ads`,
    TRACK_IMPRESSION: (id: string) => `${API_BASE_URL}/ads/${id}/impression`,
    TRACK_CLICK: (id: string) => `${API_BASE_URL}/ads/${id}/click`,
  },
}
