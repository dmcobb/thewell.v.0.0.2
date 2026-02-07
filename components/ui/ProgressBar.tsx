import React from 'react'
import { View, Text } from 'react-native'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  showLabels?: boolean
}

export const ProgressBar = ({ currentStep, totalSteps, showLabels = true }: ProgressBarProps) => {
  const progress = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100)

  return (
    <View className="w-full py-4">
      {showLabels && (
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
            Step {currentStep} of {totalSteps}
          </Text>
          <Text className="text-white text-xs font-bold">
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <View 
          className="h-full bg-primary" 
          style={{ width: `${progress}%` }} 
        />
      </View>
    </View>
  )
}