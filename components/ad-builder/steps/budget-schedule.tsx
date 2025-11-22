"use client"

/**
 * Step 3: Budget & Schedule
 * Purpose: Set ad budget and schedule
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "lucide-react"
import type { AdDraft, AdBuilderStepProps } from "@/lib/types/ad-builder"

type BudgetScheduleProps = AdBuilderStepProps

export function BudgetSchedule({ draft, onUpdate }: BudgetScheduleProps) {
  // Read directly from draft (single source of truth)
  const amount = draft.budget?.amount || 50
  const schedule = draft.budget?.schedule || "continuous"
  const startDate = draft.budget?.startDate || ""
  const endDate = draft.budget?.endDate || ""

  // Estimate reach based on budget
  const estimatedReach = Math.round(amount * 100 * (1 + Math.random() * 0.3))
  const estimatedClicks = Math.round(amount * 2 * (1 + Math.random() * 0.5))

  // Helper to update budget fields
  const updateBudget = (updates: Partial<typeof draft.budget>) => {
    onUpdate({
      budget: {
        amount,
        schedule,
        startDate,
        endDate,
        ...updates,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Budget</CardTitle>
          <CardDescription>Set how much you want to spend per day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Daily Budget (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">$</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => updateBudget({ amount: Number(e.target.value) })}
                min={5}
                step={5}
                className="text-xl font-semibold"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum $5/day</p>
          </div>

          {/* Estimates */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Estimated Results</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Daily Reach</p>
                <p className="text-lg font-semibold">
                  {estimatedReach.toLocaleString()} people
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Daily Clicks</p>
                <p className="text-lg font-semibold">{estimatedClicks.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              *Estimates based on your targeting and budget
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>When should your ad run?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={schedule} onValueChange={(v: "continuous" | "date_range") => updateBudget({ schedule: v })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="continuous" id="continuous" />
              <Label htmlFor="continuous" className="font-normal">
                Run continuously starting today
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="date_range" id="date_range" />
              <Label htmlFor="date_range" className="font-normal">
                Set start and end dates
              </Label>
            </div>
          </RadioGroup>

          {schedule === "date_range" && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => updateBudget({ startDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => updateBudget({ endDate: e.target.value })}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {schedule === "date_range" && startDate && endDate && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-medium">Total budget:</span> $
                {(
                  amount *
                  Math.ceil(
                    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ).toLocaleString()}{" "}
                over{" "}
                {Math.ceil(
                  (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

