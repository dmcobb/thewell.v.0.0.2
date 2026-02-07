// Database types matching The Well App PostgreSQL schema

export interface User {
  id: string
  email: string
  password_hash?: string
  phone_number?: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: "male" | "female"
  bio?: string
  location_city?: string
  location_state?: string
  location_country?: string
  latitude?: number
  longitude?: number
  is_verified: boolean
  is_active: boolean
  is_premium: boolean
  profile_complete: boolean
  email_verified_at?: string
  phone_verified_at?: string
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  denomination?: string
  church_name?: string
  church_attendance_frequency?: string
  occupation?: string
  education_level?: string
  height_cm?: number
  has_children: boolean
  children_count: number
  children_ages?: string
  wants_children?: boolean
  smoking_status?: string
  drinking_status?: string
  relationship_status: string
  profile_video_url?: string
  profile_video_thumbnail_url?: string
  profile_video_duration?: number
  created_at: string
  updated_at: string
}

export interface QuestionnaireResponse {
  id: string
  user_id: string
  section: string
  question_id: string
  question_text: string
  response_type: string
  response_value: string
  response_scale?: number
  created_at: string
  updated_at: string
}

export interface UserPhoto {
  id: string
  user_id: string
  photo_url: string
  photo_key: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Match {
  id: string
  user_id_1: string
  user_id_2: string
  match_score?: number
  status: "pending" | "accepted" | "rejected" | "expired"
  matched_at: string
  expires_at?: string
  created_at: string
}

export interface UserInteraction {
  id: string
  from_user_id: string
  to_user_id: string
  interaction_type: "like" | "pass" | "block"
  created_at: string
}

export interface Conversation {
  id: string
  match_id: string
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message_type: "text" | "image" | "video" | "audio"
  content?: string
  media_url?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface PrayerRequest {
  id: string
  user_id: string
  title: string
  description: string
  is_anonymous: boolean
  is_active: boolean
  prayer_count: number
  created_at: string
  updated_at: string
}

export interface PrayerResponse {
  id: string
  prayer_request_id: string
  user_id: string
  created_at: string
}

export interface Event {
  id: string
  creator_id: string
  title: string
  description: string
  event_type?: string
  location_name?: string
  location_address?: string
  latitude?: number
  longitude?: number
  start_time: string
  end_time: string
  max_attendees?: number
  is_virtual: boolean
  virtual_link?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  status: "going" | "interested" | "not_going"
  created_at: string
}

export interface VerificationRecord {
  id: string
  user_id: string
  verification_type: "email" | "phone" | "identity" | "background_check"
  status: "pending" | "verified" | "failed" | "expired"
  verification_code?: string
  verification_token?: string
  verification_data?: any
  verified_at?: string
  expires_at?: string
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  reported_content_type?: string
  reported_content_id?: string
  reason: string
  description?: string
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  square_payment_id?: string
  amount: number
  currency: string
  payment_type: string
  status: "pending" | "completed" | "failed" | "refunded"
  metadata?: any
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  square_subscription_id?: string
  plan_type: string
  status: "active" | "canceled" | "past_due" | "expired"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// Combined types for API responses
export interface UserWithProfile extends User {
  profile?: UserProfile
  photos?: UserPhoto[]
}

export interface MatchWithUsers extends Match {
  user1?: UserWithProfile
  user2?: UserWithProfile
}

export interface ConversationWithDetails extends Conversation {
  match?: MatchWithUsers
  messages?: Message[]
  unread_count?: number
}

export interface PrayerRequestWithUser extends PrayerRequest {
  user?: User
  has_prayed?: boolean
}

export interface EventWithDetails extends Event {
  creator?: User
  attendee_count?: number
  user_status?: "going" | "interested" | "not_going" | null
}
