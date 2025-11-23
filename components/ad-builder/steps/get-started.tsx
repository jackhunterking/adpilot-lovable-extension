"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Phone, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdBuilderStepProps } from "@/lib/types/ad-builder"

export function GetStarted({ draft, onUpdate }: AdBuilderStepProps) {
  const selectedGoal = draft.goal || null

  const goals = [
    { 
      id: 'signups', 
      icon: Users, 
      title: 'Get Signups', 
      description: 'Collect leads and grow your user base',
      available: true,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'traffic', 
      icon: TrendingUp, 
      title: 'Drive Traffic', 
      description: 'Get visitors to your website',
      available: false,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      id: 'calls', 
      icon: Phone, 
      title: 'Get Calls', 
      description: 'Generate phone inquiries',
      available: false,
      gradient: 'from-orange-500 to-red-500'
    },
  ]

  const handleGoalSelect = (goalId: string) => {
    if (goalId === 'signups') {
      onUpdate({ goal: goalId })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-3">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">What's your goal?</h2>
        <p className="text-muted-foreground text-lg">
          Choose your campaign objective
        </p>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const Icon = goal.icon
          const isSelected = selectedGoal === goal.id
          const isAvailable = goal.available

          return (
            <Card 
              key={goal.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200",
                isAvailable && "hover:shadow-xl hover:scale-105",
                isSelected && "ring-2 ring-primary shadow-xl scale-105",
                !isAvailable && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => handleGoalSelect(goal.id)}
            >
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                {/* Icon with gradient background */}
                <div className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br",
                  goal.gradient
                )}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                </div>

                {/* Coming Soon Badge */}
                {!isAvailable && (
                  <Badge variant="secondary" className="absolute top-3 right-3">
                    Coming Soon
                  </Badge>
                )}

                {/* Selected Badge */}
                {isSelected && (
                  <Badge className="absolute top-3 right-3">
                    Selected
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Helper text */}
      {!selectedGoal && (
        <p className="text-center text-sm text-muted-foreground">
          👆 Select a goal to continue
        </p>
      )}
    </div>
  )
}
