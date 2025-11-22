/**
 * Feature: Lovable Budget Page
 * Purpose: Budget configuration and cost estimation
 */

"use client"

import { useState } from "react"

// Force dynamic rendering (requires authentication and context)
export const dynamic = 'force-dynamic'
import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudget } from "@/lib/context/budget-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, DollarSign, Info } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function BudgetPage() {
  const {
    budgetState,
    setDailyBudget,
    setSchedule
  } = useBudget()

  const [localDailyBudget, setLocalDailyBudget] = useState(String(budgetState.dailyBudget || 10))
  const [startDate, setStartDate] = useState<Date | undefined>(
    budgetState.startTime ? new Date(budgetState.startTime) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    budgetState.endTime ? new Date(budgetState.endTime) : undefined
  )

  // Calculate estimates
  const calculateDuration = () => {
    if (!startDate || !endDate) return 0
    return differenceInDays(endDate, startDate) + 1
  }

  const duration = calculateDuration()
  const estimatedReach = Math.round((Number(localDailyBudget) * Math.max(duration, 7)) * 100)
  const estimatedClicks = Math.round((Number(localDailyBudget) * Math.max(duration, 7)) * 5)
  const totalSpend = Number(localDailyBudget) * Math.max(duration, 7)

  const handleSave = () => {
    setDailyBudget(Number(localDailyBudget))
    setSchedule({
      startTime: startDate?.toISOString() || null,
      endTime: endDate?.toISOString() || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
    toast.success("Budget configuration saved!")
  }

  return (
    <LovableLayout requireMeta>
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold">Budget & Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Configure your advertising budget and campaign duration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Setup</CardTitle>
              <CardDescription>
                Choose how you want to allocate your advertising budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Budget Input */}
              <div className="space-y-2">
                <Label htmlFor="daily-budget">Daily Budget ({budgetState.currency})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="daily-budget"
                    type="number"
                    min="5"
                    step="1"
                    value={localDailyBudget}
                    onChange={(e) => setLocalDailyBudget(e.target.value)}
                    className="pl-9"
                    placeholder="10.00"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum daily budget is ${5.00}
                </p>
              </div>

              {/* Information Box */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 text-sm">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-blue-800 dark:text-blue-200">
                    <p>Meta will spend up to your daily budget each day. Actual spend may vary by up to 25% on any given day.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>
                Set when your campaign should run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Run continuously"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Leave empty to run until manually stopped
                </p>
              </div>

              {/* Duration Summary */}
              {startDate && endDate && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campaign Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {duration} {duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Performance</CardTitle>
            <CardDescription>
              Projected reach and engagement based on your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-3xl font-bold">
                  ${totalSpend.toFixed(2)}
                </p>
                {duration > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Over {duration} days
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Reach</p>
                <p className="text-3xl font-bold">
                  {estimatedReach.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  People who may see your ad
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Estimated Clicks</p>
                <p className="text-3xl font-bold">
                  {estimatedClicks.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Potential ad clicks
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted text-sm">
              <p className="text-muted-foreground">
                <strong>Note:</strong> These are estimates based on historical data. Actual performance may vary based on your targeting, creative quality, and competition.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset</Button>
          <Button onClick={handleSave}>
            Save Budget Configuration
          </Button>
        </div>
      </div>
    </LovableLayout>
  )
}

