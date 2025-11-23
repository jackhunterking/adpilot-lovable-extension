"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutDashboard, TrendingUp, Megaphone, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  url: string
}

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, url: "/lovable?view=overview" },
  { label: "Ads", icon: Megaphone, url: "/lovable?view=all-ads" },
  { label: "Integrations", icon: Zap, url: "/lovable/integrations" },
  { label: "Analytics", icon: TrendingUp, url: "/lovable/analytics" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
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

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            
            // Check if URL has search params
            const urlObj = new URL(item.url, window.location.origin)
            const itemViewParam = urlObj.searchParams.get('view')
            const currentViewParam = searchParams.get('view')
            const itemPathname = urlObj.pathname
            
            // For Overview and Ads (items with view param), check both pathname and view param
            // Special case: When on /lovable with no view param, treat as Overview (default)
            // For other items (Integrations, Settings), just check pathname
            const isActive = itemViewParam 
              ? (pathname === itemPathname && currentViewParam === itemViewParam) ||
                (pathname === '/lovable' && !currentViewParam && item.label === 'Overview')
              : pathname === item.url
            
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

