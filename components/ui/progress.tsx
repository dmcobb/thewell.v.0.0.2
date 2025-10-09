import { View } from "react-native"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <View className={cn("h-2 bg-slate-200 rounded-full overflow-hidden", className)}>
      <View
        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </View>
  )
}
