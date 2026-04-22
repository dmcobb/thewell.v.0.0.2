export const API_URL = "https://api.the-wellapp.com"
export const API_VERSION = "v1"
export const SOCKET_URL = "https://api.the-wellapp.com"

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
    GET_LIKES: "/matches/likes",
    LIKE: (userId: string) => `/matches/like/${userId}`,
    UNLIKE: (userId: string) => `/matches/unlike/${userId}`,
    PASS: (userId: string) => `/matches/pass/${userId}`,
    UNMATCH: (matchId: string) => `/matches/${matchId}`,
  },
  // Messages
  MESSAGES: {
    GET_CONVERSATIONS: "/messages/conversations/",
    GET_MESSAGES: (conversationId: string) => `/messages/conversations/${conversationId}`,
    SEND_MESSAGE: (conversationId: string) => `/messages/conversations/${conversationId}`,
    SEND_MEDIA: (conversationId: string) => `/messages/conversations/${conversationId}/media`,
    MARK_READ: (conversationId: string) => `/messages/conversations/${conversationId}/read`,
    DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
  },
  // Media
  MEDIA: {
    UPLOAD: "/media/upload",
    UPLOAD_VIDEO: "/media/video/profile",
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
    CREATE_INTENT: "/payments/create-intent",
    PROCESS: "/payments/process",
    VERIFY: (paymentId: string) => `/payments/verify/${paymentId}`,
    CREATE_SUBSCRIPTION: "/subscriptions",
    CANCEL_SUBSCRIPTION: "/subscriptions/cancel",
    GET_PAYMENT_METHODS: "/payments/methods",
    HISTORY: "/payments/history",
    WEBHOOK: "/payments/webhook",
  },
  // Transactions
  TRANSACTIONS: {
    LATEST: "/transactions/latest",
    ALL: "/transactions",
    GET_BY_ID: (id: string) => `/transactions/${id}`,
  },
  // Ads
  ADS: {
    GET_ADS: "/ads/feed",
    TRACK_IMPRESSION: (id: string) => `/ads/${id}/impression`,
    TRACK_CLICK: (id: string) => `/ads/${id}/click`,
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    GET_PLANS: "/subscriptions/plans",
    GET_SUBSCRIPTION: "/subscriptions/me",
    ACTIVATE_TRIAL: "/subscriptions/trial",
    CHECK_DAILY_LIKES: "/subscriptions/daily-likes/check",
    INCREMENT_DAILY_LIKES: "/subscriptions/daily-likes/increment",
    CREATE_PAYMENT: "/subscriptions/create-payment",
    VERIFY_PAYMENT: (paymentId: string) => `/subscriptions/verify-payment/${paymentId}`,
  },
  // Moderation
  MODERATION: {
    LOG_ACTIVITY: "/moderation/log-activity",
    GET_LOGS: "/moderation/logs",
  },
}