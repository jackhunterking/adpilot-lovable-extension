"use client"

import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Settings, Megaphone, Plus, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  url: string
}

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, url: "/lovable" },
  { label: "Ads", icon: Megaphone, url: "/lovable" },
  { label: "Integrations", icon: Zap, url: "/lovable/campaigns" },
  { label: "Settings", icon: Settings, url: "/lovable/analytics" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M13 2L3 6v4l10 4V2zM2 7h1v2H2V7zm13 5.5l-9-3.6V7.1l9-3.6v8.5z"/>
            </svg>
          </div>
          <span className="font-semibold text-lg">AdPilot</span>
        </div>
      </div>

      {/* Create Ad CTA Button */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={() => router.push("/lovable")}
          className="w-full gap-2"
          size="default"
        >
          <Plus className="w-4 h-4" />
          Create Ad
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.url
            
            return (
              <li key={item.url}>
                <button
                  onClick={() => router.push(item.url)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    "text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          AdPilot for Lovable v0.2.0
        </p>
      </div>
    </aside>
  )
}

