import type React from "react"
import { View, Text } from "react-native"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <View className={cn("bg-white rounded-xl shadow-lg overflow-hidden", className)}>{children}</View>
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <View className={cn("p-4", className)}>{children}</View>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <Text className={cn("text-lg font-semibold text-slate-800", className)}>{children}</Text>
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn("p-4", className)}>{children}</View>
}
