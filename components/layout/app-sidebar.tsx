"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { LayoutDashboard, Settings, Megaphone, Zap, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlatformSelector } from "@/components/platform-selector"

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  disabled?: boolean
  comingSoon?: boolean
}

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, url: "/lovable?view=overview" },
  { label: "Ads", icon: Megaphone, url: "/lovable?view=all-ads", disabled: true, comingSoon: true },
  { label: "Posts", icon: MessageSquare, url: "/lovable/posts" },
  { label: "Integrations", icon: Zap, url: "/lovable/integrations" },
  { label: "Settings", icon: Settings, url: "/lovable/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Platform Selector */}
      <div className="p-4 border-b border-border">
        <PlatformSelector />
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
                  onClick={() => !item.disabled && router.push(item.url)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                    "text-sm font-medium relative",
                    item.disabled 
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.comingSoon && (
                    <Badge variant="outline" className="text-xs py-0 px-1.5 h-5">
                      Soon
                    </Badge>
                  )}
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

