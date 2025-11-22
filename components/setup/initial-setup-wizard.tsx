"use client"

/**
 * Feature: Initial Setup Wizard
 * Purpose: Guide first-time users through Meta account connection and conversion tracking setup
 * References:
 *  - Meta OAuth: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 *  - Meta Conversions API: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, AlertCircle, Sparkles, Facebook } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { triggerLovableAI, PromptTemplates } from "@/lib/utils/trigger-lovable-ai"
import { openFacebookOAuthPopup } from "@/lib/utils/facebook-auth"

interface InitialSetupWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AdAccount {
  id: string
  name: string
  account_id: string
}

export function InitialSetupWizard({ open, onOpenChange }: InitialSetupWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Step 2: Meta Connection
  const [metaConnected, setMetaConnected] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([])
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("")
  
  // Step 3: Conversion Tracking
  const [conversionCode, setConversionCode] = useState("")
  const [conversionSetupComplete, setConversionSetupComplete] = useState(false)
  const [aiPromptShown, setAiPromptShown] = useState(false)

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  // OAuth is now handled via openFacebookOAuthPopup() utility
  // No need for message listener in component

  const handleOAuthCode = async (code: string) => {
    try {
      setLoading(true)
      
      // ⚠️ BACKEND OPERATION: Exchange OAuth code for access token
      const response = await fetch('/api/v1/meta/oauth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange OAuth code')
      }

      const { access_token, ad_accounts } = await response.json()
      
      setAccessToken(access_token)
      setAdAccounts(ad_accounts)
      setMetaConnected(true)
      
      toast.success('✓ Connected to Meta successfully!')
    } catch (error) {
      console.error('OAuth error:', error)
      toast.error('Failed to connect to Meta. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectMeta = async () => {
    try {
      setLoading(true)
      
      // Open OAuth popup and wait for code
      const code = await openFacebookOAuthPopup()
      
      // Exchange code for access token
      await handleOAuthCode(code)
      
    } catch (error: any) {
      console.error('[SetupWizard] OAuth error:', error)
      
      // Handle specific error cases
      if (error.message === 'Popup blocked') {
        toast.error('Please allow popups for this site', {
          description: 'Check your browser settings to enable popups',
        })
      } else if (error.message === 'Popup closed by user') {
        toast.error('Authorization cancelled', {
          description: 'You closed the window before completing authorization',
        })
      } else if (error.message.includes('not configured')) {
        toast.error('Facebook App not configured', {
          description: 'Please add NEXT_PUBLIC_FB_APP_ID to your environment variables',
        })
      } else if (error.message === 'OAuth timeout') {
        toast.error('Authorization timeout', {
          description: 'Please try again',
        })
      } else {
        toast.error('Failed to connect Facebook account', {
          description: error.message || 'Unknown error',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAdAccount = async () => {
    if (!selectedAdAccount || !accessToken) {
      toast.error('Please select an ad account')
      return
    }

    try {
      setLoading(true)

      // ⚠️ BACKEND OPERATION: Store Meta connection in Supabase
      const { error } = await supabase
        .from('meta_connections')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          access_token: accessToken,
          ad_account_id: selectedAdAccount,
          status: 'active',
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success('Ad account saved!')
      setCurrentStep(3)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save ad account')
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerAI = () => {
    setAiPromptShown(true)
    
    // Get Lovable project ID from session
    const lovableProjectId = sessionStorage.getItem('adpilot_lovable_project_id')
    
    // Generate prompt using template
    const prompt = PromptTemplates.generateConversionTracking({
      eventType: 'Lead',
    })
    
    // Trigger Lovable AI with the prompt
    triggerLovableAI({
      prompt,
      context: {
        feature: 'conversion-tracking',
        lovableProjectId,
      },
      toastMessage: 'AI is generating your conversion tracking code!',
    })
    
    // Also copy to clipboard as backup
    navigator.clipboard.writeText(prompt).catch(err => {
      console.error('Failed to copy to clipboard:', err)
    })
  }

  const handleDeployConversion = async () => {
    if (!conversionCode.trim()) {
      toast.error('Please paste the generated code')
      return
    }

    try {
      setLoading(true)

      // ⚠️ BACKEND OPERATION: Deploy edge function to Supabase
      
      // This would typically use Supabase Management API
      // For now, we'll simulate the deployment
      const response = await fetch('/api/v1/supabase/deploy-edge-function', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'meta-conversion-tracking',
          code: conversionCode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deploy edge function')
      }

      // Test the conversion event
      const testResponse = await fetch('/api/v1/meta/test-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          event_type: 'Lead',
        }),
      })

      if (!testResponse.ok) {
        throw new Error('Conversion test failed')
      }

      setConversionSetupComplete(true)
      toast.success('✓ Conversion tracking is live!')
    } catch (error) {
      console.error('Deploy error:', error)
      toast.error('Failed to deploy conversion tracking')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    onOpenChange(false)
    router.push('/ad/create')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome to AdPilot!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create and manage Meta ads directly from Lovable. Let's get you set up in 2 minutes.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="min-w-[200px]"
              >
                Get Started
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Connect Your Meta Ad Account</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We need access to your Meta ad account to create and manage ads.
              </p>
            </div>

            {!metaConnected ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <Button
                  size="lg"
                  onClick={handleConnectMeta}
                  disabled={loading}
                  className="min-w-[250px] gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Facebook className="w-5 h-5" />
                      Connect with Facebook
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  A popup window will open for authentication
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Connected successfully</span>
                </div>

                <div className="space-y-2">
                  <Label>Select Your Ad Account</Label>
                  <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an ad account" />
                    </SelectTrigger>
                    <SelectContent>
                      {adAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.account_id}>
                          {account.name} ({account.account_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={handleSaveAdAccount}
                    disabled={!selectedAdAccount || loading}
                    className="min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Setup Conversion Tracking</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We'll automatically configure Meta Conversion API for your project.
              </p>
            </div>

            {!aiPromptShown ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <Button
                  size="lg"
                  onClick={handleTriggerAI}
                  className="min-w-[250px] gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  ✨ Auto-Setup with AI
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {!conversionSetupComplete ? (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                            Instructions
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            The AI prompt has been copied to your clipboard. Open the Lovable AI chat, paste the prompt, and copy the generated code back here.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Paste Generated Code</Label>
                      <Textarea
                        value={conversionCode}
                        onChange={(e) => setConversionCode(e.target.value)}
                        placeholder="Paste the edge function code generated by AI..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        size="lg"
                        onClick={handleDeployConversion}
                        disabled={!conversionCode.trim() || loading}
                        className="min-w-[200px]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Deploying...
                          </>
                        ) : (
                          'Deploy'
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-medium text-lg">Conversion tracking is live!</span>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        size="lg"
                        onClick={handleComplete}
                        className="min-w-[250px]"
                      >
                        Done - Create My First Ad
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </DialogTitle>
              {currentStep > 1 && !metaConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="mt-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

