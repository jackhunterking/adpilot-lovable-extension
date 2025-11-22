"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Mail, Calendar, Key, Shield, LogOut, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ProfileTab() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [createdAt, setCreatedAt] = useState<string>("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)

      // Get user from auth
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserEmail(user.email || "")
        setUserId(user.id)
        setCreatedAt(user.created_at || "")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const handlePasswordReset = async () => {
    if (!userEmail) {
      toast.error("No email address found")
      return
    }

    try {
      setIsResettingPassword(true)
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/post-verify`,
      })

      if (error) throw error

      toast.success("Password reset email sent! Check your inbox.")
    } catch (error) {
      console.error("Error sending password reset:", error)
      toast.error("Failed to send password reset email. Please try again.")
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast.success("Logged out successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true)

      // Call API to delete user account
      const response = await fetch("/api/v1/user/delete", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast.success("Account deleted successfully")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account. Please try again or contact support.")
      setIsDeletingAccount(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your AdPilot account details and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Email Address</Label>
              <p className="text-sm text-muted-foreground mt-1">{userEmail || "Not available"}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">User ID</Label>
              <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                {userId || "Not available"}
              </p>
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Account Created</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Password</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Reset your password via email
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasswordReset}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4" />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Sign Out</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Sign out of your AdPilot account
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">Delete Account</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All ad campaigns and drafts</li>
                <li>Meta account connections</li>
                <li>Analytics and performance data</li>
                <li>Account settings and preferences</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

