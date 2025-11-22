/**
 * Feature: Feature Card
 * Purpose: Consistent card UI for Lovable features
 */

"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  onClick?: () => void
  children?: ReactNode
  className?: string
  disabled?: boolean
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  onClick,
  children,
  className,
  disabled = false
}: FeatureCardProps) {
  const isClickable = !!onClick && !disabled

  return (
    <Card
      className={cn(
        "transition-all",
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1.5">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  )
}

