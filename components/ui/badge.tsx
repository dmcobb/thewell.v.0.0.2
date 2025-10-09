import type React from "react"
import { View, Text } from "react-native"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variantStyles = {
    default: "bg-primary",
    outline: "border border-purple-200 bg-transparent",
    secondary: "bg-purple-50",
  }

  const textVariantStyles = {
    default: "text-white",
    outline: "text-purple-500",
    secondary: "text-purple-700",
  }

  return (
    <View className={cn("px-2 py-1 rounded-md flex-row items-center", variantStyles[variant], className)}>
      {typeof children === "string" ? (
        <Text className={cn("text-xs font-medium", textVariantStyles[variant])}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}
