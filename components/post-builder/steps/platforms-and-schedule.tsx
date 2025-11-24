"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Facebook, Instagram } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import type { PostBuilderStepProps } from "@/lib/types/post"
import { cn } from "@/lib/utils"

export function PlatformsAndSchedule({ draft, onUpdate }: PostBuilderStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    draft.scheduledAt ? new Date(draft.scheduledAt) : undefined
  )
  const [selectedTime, setSelectedTime] = useState(
    draft.scheduledAt ? format(new Date(draft.scheduledAt), 'HH:mm') : '12:00'
  )

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const [hours, minutes] = selectedTime.split(':')
      date.setHours(parseInt(hours), parseInt(minutes))
      onUpdate({ scheduledAt: date.toISOString() })
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    if (selectedDate) {
      const [hours, minutes] = time.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onUpdate({ scheduledAt: newDate.toISOString() })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Platforms & Schedule</h2>
        <p className="text-muted-foreground text-lg">
          Choose where and when to publish
        </p>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
          <CardDescription>
            Choose which platforms to publish your post to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="facebook"
              checked={draft.publishToFacebook}
              onCheckedChange={(checked) => onUpdate({ publishToFacebook: !!checked })}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="facebook"
                className="flex items-center gap-2 text-base font-medium cursor-pointer"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </Label>
              <p className="text-sm text-muted-foreground">
                Post to your Facebook Page
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="instagram"
              checked={draft.publishToInstagram}
              onCheckedChange={(checked) => onUpdate({ publishToInstagram: !!checked })}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="instagram"
                className="flex items-center gap-2 text-base font-medium cursor-pointer"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                Instagram
              </Label>
              <p className="text-sm text-muted-foreground">
                Post to your Instagram account
              </p>
              {draft.publishToInstagram && !draft.mediaUrl && (
                <p className="text-sm text-yellow-600">
                  ⚠️ Instagram requires an image or video
                </p>
              )}
            </div>
          </div>

          {!draft.publishToFacebook && !draft.publishToInstagram && (
            <p className="text-sm text-red-600">
              Please select at least one platform
            </p>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Publish immediately or schedule for later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={draft.scheduleType}
            onValueChange={(value) => onUpdate({ scheduleType: value as 'immediate' | 'scheduled' })}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="scheduled" id="scheduled" />
              <Label htmlFor="scheduled" className="cursor-pointer">
                Schedule for later
              </Label>
            </div>
          </RadioGroup>

          {draft.scheduleType === 'scheduled' && (
            <div className="space-y-4 pl-7">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <Label>Select Time</Label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {selectedDate && (
                <p className="text-sm text-muted-foreground">
                  Post will be published on{' '}
                  <span className="font-medium text-foreground">
                    {format(selectedDate, 'PPP')} at {selectedTime}
                  </span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

