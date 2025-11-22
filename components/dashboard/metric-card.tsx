"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  loading?: boolean
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  loading = false,
}: MetricCardProps) {
  const changePositive = change && change > 0
  const changeNegative = change && change < 0
  const changeNeutral = change === 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-24 mb-2" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                {changePositive && (
                  <ArrowUp className="w-3 h-3 text-green-500" />
                )}
                {changeNegative && (
                  <ArrowDown className="w-3 h-3 text-red-500" />
                )}
                {changeNeutral && <Minus className="w-3 h-3 text-gray-500" />}
                <span
                  className={cn(
                    "font-medium",
                    changePositive && "text-green-500",
                    changeNegative && "text-red-500",
                    changeNeutral && "text-gray-500"
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

