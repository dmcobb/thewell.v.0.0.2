import { apiClient } from "../api-client"
import * as Localization from "expo-localization"

export interface Devotional {
  text: string
  reference: string
  reflection: string
  prayer: string
  date: string
}

class DevotionalService {
  async getDailyDevotional(): Promise<Devotional> {
    // Get the user's current timezone
    const userTimezone = Localization.getCalendars()[0]?.timeZone || 'UTC'

    const response = await apiClient.get<{ data: Devotional }>("/devotional/daily", {
      headers: {
        'x-user-timezone': userTimezone
      }
    })
      
    return response.data
  }
}

export const devotionalService = new DevotionalService()