import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface Event {
  id: string
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  imageUrl?: string
  organizerId: string
  organizerName: string
  attendeeCount: number
  maxAttendees?: number
  isAttending: boolean
  createdAt: string
}

export interface CreateEventData {
  title: string
  description: string
  location: string
  startDate: string
  endDate: string
  imageUrl?: string
  maxAttendees?: number
}

class EventService {
  async getEvents(upcoming = true): Promise<Event[]> {
    const endpoint = `${API_ENDPOINTS.EVENTS.GET_EVENTS}?upcoming=${upcoming}`
    return apiClient.get<Event[]>(endpoint)
  }

  async getEvent(id: string): Promise<Event> {
    return apiClient.get<Event>(API_ENDPOINTS.EVENTS.GET_EVENT(id))
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    return apiClient.post<Event>(API_ENDPOINTS.EVENTS.CREATE_EVENT, data)
  }

  async rsvpEvent(eventId: string, attending: boolean): Promise<{ success: boolean }> {
    return apiClient.post(API_ENDPOINTS.EVENTS.RSVP(eventId), { attending })
  }
}

export const eventService = new EventService()
