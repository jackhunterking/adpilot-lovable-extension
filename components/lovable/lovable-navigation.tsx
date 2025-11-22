/**
 * Feature: Lovable Navigation
 * Purpose: Tab navigation for all Lovable extension pages
 */

"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Image, 
  FileText, 
  Target, 
  DollarSign, 
  FolderKanban, 
  BarChart3 
} from "lucide-react"

const navigationItems = [
  {
    id: "dashboard",
    label: "Ads",
    href: "/lovable",
    icon: LayoutDashboard,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/lovable/analytics",
    icon: BarChart3,
  },
  {
    id: "campaigns",
    label: "Campaigns",
    href: "/lovable/campaigns",
    icon: FolderKanban,
  },
]

export function LovableNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/lovable" && pathname?.startsWith(item.href))
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

