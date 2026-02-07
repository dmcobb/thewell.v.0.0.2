import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../constants"

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: "text" | "image" | "video"
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  matchId: string
  otherUser: {
    id: string
    firstName: string
    photo: string
  }
  lastMessage: Message
  unreadCount: number
}

class MessageService {
  async getConversations(): Promise<Conversation[]> {
    return apiClient.get<Conversation[]>(API_ENDPOINTS.MESSAGES.GET_CONVERSATIONS)
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return apiClient.get<Message[]>(API_ENDPOINTS.MESSAGES.GET_MESSAGES(conversationId))
  }

  async sendMessage(
    conversationId: string,
    content: string,
    type: "text" | "image" | "video" = "text",
  ): Promise<Message> {
    return apiClient.post<Message>(API_ENDPOINTS.MESSAGES.SEND_MESSAGE(conversationId), {
      conversationId,
      content,
      type,
    })
  }

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    return apiClient.delete(API_ENDPOINTS.MESSAGES.DELETE_MESSAGE(messageId))
  }
}

export const messageService = new MessageService()
