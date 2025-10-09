import type React from "react"
import { Text } from "react-native"
import { cn } from "@/lib/utils"

interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export function Label({ children, className }: LabelProps) {
  return <Text className={cn("text-sm font-medium text-slate-700", className)}>{children}</Text>
}
