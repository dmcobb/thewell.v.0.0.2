export const API_URL = "http://192.168.1.85:5000"
export const API_VERSION = "v1"
export const SOCKET_URL = "http://192.168.1.85:5000"

// Build full API base URL
export const API_BASE_URL = `${API_URL}/api/${API_VERSION}`

// API Endpoints - using relative paths instead of full URLs
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  // Users
  USERS: {
    PROFILE: "/users/me",
    UPDATE_PROFILE: "/users/me",
    UPLOAD_PHOTOS: "/users/me/photos",
    DELETE_PHOTO: (photoId: string) => `/users/me/photos/${photoId}`,
    SET_PRIMARY_PHOTO: (photoId: string) => `/users/me/photos/${photoId}/primary`,
    GET_USER: (userId: string) => `/users/${userId}`,
    SUBMIT_QUESTIONNAIRE: "/users/me/questionnaire",
    GET_QUESTIONNAIRE: "/users/me/questionnaire",
    PREFERENCES: "/users/me/preferences",
    UPDATE_PREFERENCES: "/users/me/preferences",
    DEACTIVATE: "/users/me/deactivate",
    DELETE: "/users/me",
    SAVE_ONBOARDING_PROGRESS: "/users/me/onboarding-progress",
    GET_ONBOARDING_PROGRESS: "/users/me/onboarding-progress",
  },
  // Matches
  MATCHES: {
    DISCOVER: "/matches/discover",
    GET_MATCHES: "/matches",
    GET_MATCH: (id: string) => `/matches/${id}`,
    LIKE: (userId: string) => `/matches/like/${userId}`,
    PASS: (userId: string) => `/matches/pass/${userId}`,
    UNMATCH: (matchId: string) => `/matches/${matchId}`,
  },
  // Messages
  MESSAGES: {
    GET_CONVERSATIONS: "/messages/conversations",
    GET_MESSAGES: (conversationId: string) => `/messages/${conversationId}`,
    SEND_MESSAGE: (conversationId: string) => `/messages/${conversationId}`,
    SEND_MEDIA: (conversationId: string) => `/messages/${conversationId}/media`,
    MARK_READ: (conversationId: string) => `/messages/${conversationId}/read`,
    DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
  },
  // Media
  MEDIA: {
    UPLOAD: "/media/upload",
    DELETE: (id: string) => `/media/${id}`,
  },
  // Prayers
  PRAYERS: {
    GET_PRAYERS: "/prayers",
    GET_MY_PRAYERS: "/prayers/my-requests",
    CREATE_PRAYER: "/prayers",
    UPDATE_PRAYER: (requestId: string) => `/prayers/${requestId}`,
    DELETE_PRAYER: (requestId: string) => `/prayers/${requestId}`,
    PRAY_FOR: (requestId: string) => `/prayers/${requestId}/pray`,
  },
  // Events
  EVENTS: {
    GET_EVENTS: "/events",
    GET_EVENT: (id: string) => `/events/${id}`,
    CREATE_EVENT: "/events",
    RSVP: (id: string) => `/events/${id}/rsvp`,
  },
  // Verification
  VERIFICATION: {
    REQUEST: "/verification/request",
    STATUS: "/verification/status",
  },
  // Analytics
  ANALYTICS: {
    TRACK_EVENT: "/analytics/event",
    GET_STATS: "/analytics/stats",
  },
  // Payments
  PAYMENTS: {
    CREATE_SUBSCRIPTION: "/payments/subscription",
    CANCEL_SUBSCRIPTION: "/payments/subscription/cancel",
    GET_PAYMENT_METHODS: "/payments/methods",
  },
  // Ads
  ADS: {
    GET_ADS: "/ads",
    TRACK_IMPRESSION: (id: string) => `/ads/${id}/impression`,
    TRACK_CLICK: (id: string) => `/ads/${id}/click`,
  },
}