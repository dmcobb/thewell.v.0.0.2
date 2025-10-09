import type React from "react"

import { View, TouchableOpacity } from "react-native"
import { cn } from "@/lib/utils"
import { createContext, useContext } from "react"

interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined)

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View className={cn("gap-2", className)}>{children}</View>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  id: string
  className?: string
}

export function RadioGroupItem({ value, id, className }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext)
  if (!context) throw new Error("RadioGroupItem must be used within RadioGroup")

  const isSelected = context.value === value

  return (
    <TouchableOpacity
      onPress={() => context.onValueChange(value)}
      className={cn(
        "w-5 h-5 rounded-full border-2 items-center justify-center",
        isSelected ? "border-primary" : "border-slate-300",
        className,
      )}
      activeOpacity={0.7}
    >
      {isSelected && <View className="w-3 h-3 rounded-full bg-primary" />}
    </TouchableOpacity>
  )
}
