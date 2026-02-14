import { io, type Socket } from "socket.io-client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SOCKET_URL } from "../constants"

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log("[Anointed Innovations] Socket already connected")
      return
    }

    try {
      const token = await AsyncStorage.getItem("authToken")

      if (!token) {
        console.error("[Anointed Innovations] No auth token found for socket connection")
        return
      }

      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      })

      this.socket.on("connect", () => {
        console.log("[Anointed Innovations] Socket connected:", this.socket?.id)
      })

      this.socket.on("disconnect", (reason) => {
        console.log("[Anointed Innovations] Socket disconnected:", reason)
      })

      this.socket.on("connect_error", (error) => {
        console.error("[Anointed Innovations] Socket connection error:", error.message)
      })

      this.socket.on("error", (error) => {
        console.error("[Anointed Innovations] Socket error:", error)
      })

      // Re-attach all listeners after reconnection
      this.socket.on("connect", () => {
        this.reattachListeners()
      })
    } catch (error) {
      console.error("[Anointed Innovations] Error connecting socket:", error)
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.listeners.clear()
      console.log("[Anointed Innovations] Socket disconnected")
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(callback)

    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback)
      if (this.socket) {
        this.socket.off(event, callback as any)
      }
    } else {
      this.listeners.delete(event)
      if (this.socket) {
        this.socket.off(event)
      }
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn("[Anointed Innovations] Socket not connected, cannot emit:", event)
    }
  }

  private reattachListeners(): void {
    if (!this.socket) return

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any)
      })
    })
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  // Message-specific methods
  joinConversation(conversationId: string): void {
    this.emit("join_conversation", { conversationId })
  }

  leaveConversation(conversationId: string): void {
    this.emit("leave_conversation", { conversationId })
  }

  sendMessage(conversationId: string, message: string): void {
    this.emit("send_message", { conversationId, message })
  }

  onJoinedConversation(callback: (data: any) => void): void {
    this.on("joined_conversation", callback)
  }

  onNewMessage(callback: (message: any) => void): void {
    this.on("new_message", callback)
  }

  onMessageRead(callback: (data: any) => void): void {
    this.on("message_read", callback)
  }

  onTyping(callback: (data: any) => void): void {
    this.on("typing", callback)
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    this.emit("typing", { conversationId, isTyping })
  }

  // Match-specific methods
  onNewMatch(callback: (match: any) => void): void {
    this.on("new_match", callback)
  }

  onMatchUpdate(callback: (data: any) => void): void {
    this.on("match_update", callback)
  }
}

export const socketService = new SocketService()