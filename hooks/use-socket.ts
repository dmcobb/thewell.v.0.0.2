import { useEffect, useRef } from "react"
import { socketService } from "../lib/services/socket.service"
import { useAuth } from "../contexts/auth-context"

export function useSocket() {
  const { isAuthenticated } = useAuth()
  const isConnecting = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !socketService.isConnected() && !isConnecting.current) {
      isConnecting.current = true
      socketService.connect().finally(() => {
        isConnecting.current = false
      })
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated])

  return socketService
}
