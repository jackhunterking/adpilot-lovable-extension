"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

export function GeneralTab() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how AdPilot looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2 flex-1"
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2 flex-1"
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="gap-2 flex-1"
              >
                <Monitor className="w-4 h-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lovable Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Lovable Integration</CardTitle>
          <CardDescription>
            Project-specific settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Project ID</Label>
            <p className="text-sm text-muted-foreground font-mono">
              {typeof window !== "undefined"
                ? sessionStorage.getItem("adpilot_lovable_project_id") || "Not detected"
                : "Loading..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

