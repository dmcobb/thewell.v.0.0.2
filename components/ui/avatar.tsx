import type React from "react"
import { View, Text } from "react-native"
import { Image } from "expo-image"
import { cn } from "@/lib/utils"

interface AvatarProps {
  children: React.ReactNode
  className?: string
}

export function Avatar({ children, className }: AvatarProps) {
  return <View className={cn("w-12 h-12 rounded-full overflow-hidden bg-slate-200", className)}>{children}</View>
}

interface AvatarImageProps {
  source: any
  className?: string
}

export function AvatarImage({ source, className }: AvatarImageProps) {
  return <Image source={source} className={cn("w-full h-full", className)} contentFit="cover" />
}

interface AvatarFallbackProps {
  children: React.ReactNode
  className?: string
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return (
    <View
      className={cn("w-full h-full items-center justify-center bg-gradient-to-br from-ocean-400 to-primary", className)}
    >
      {typeof children === "string" ? <Text className="text-white text-lg font-semibold">{children}</Text> : children}
    </View>
  )
}
