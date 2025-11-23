/**
 * Feature: Lovable Settings Page
 * Purpose: Manage account, billing, and preferences
 */

"use client"

import { LovableLayout } from "@/components/lovable/lovable-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/settings/profile-tab"
import { BillingTab } from "@/components/settings/billing-tab"
import { GeneralTab } from "@/components/settings/general-tab"
import { User, CreditCard, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  return (
    <LovableLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, billing, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingTab />
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <GeneralTab />
          </TabsContent>
        </Tabs>
      </div>
    </LovableLayout>
  )
}

