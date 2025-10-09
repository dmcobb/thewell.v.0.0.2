import type React from "react"
import { TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { cn } from "@/lib/utils"

interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  className,
}: ButtonProps) {
  const baseStyles = "items-center justify-center rounded-lg flex-row"

  const variantStyles = {
    default: "bg-primary",
    outline: "border border-purple-200 bg-white",
    ghost: "bg-transparent",
  }

  const sizeStyles = {
    default: "h-12 px-4",
    sm: "h-10 px-3",
    lg: "h-14 px-6",
  }

  const textVariantStyles = {
    default: "text-white font-medium",
    outline: "text-purple-500 font-medium",
    ghost: "text-slate-700 font-medium",
  }

  const textSizeStyles = {
    default: "text-base",
    sm: "text-sm",
    lg: "text-lg",
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], disabled && "opacity-50", className)}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === "default" ? "white" : "#8B5CF6"} />
      ) : typeof children === "string" ? (
        <Text className={cn(textVariantStyles[variant], textSizeStyles[size])}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}
