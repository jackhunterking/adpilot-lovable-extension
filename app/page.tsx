/**
 * Feature: Extension Download Landing Page
 * Purpose: Landing page for users visiting the site directly (not in Lovable iframe)
 * User Journey: Explain extension → Download from Chrome Web Store → Install → Use in Lovable
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { COMPANY_NAME, CHROME_STORE_URL } from '@/lib/constants'
import { Chrome, Check, Sparkles } from 'lucide-react'

export default function ExtensionDownloadPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative h-10 w-10">
            <img src="/AdPilot-NewLogo.svg" alt="AdPilot" className="h-10 w-10" />
          </div>
          <span className="text-2xl font-semibold">{COMPANY_NAME}</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16">
            {/* Platform badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
              <span>For Lovable Developers</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {COMPANY_NAME} for Lovable
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Create and manage Meta Ads with AI, directly from your Lovable editor
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button size="lg" className="text-lg px-8 py-6 gap-3" asChild>
                <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
                  <Chrome className="w-6 h-6" />
                  Download Chrome Extension
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Free to install • Works with any Lovable project
              </p>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border p-8 md:p-12 space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Get Started in 3 Simple Steps
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">Install the Extension</h3>
                  <p className="text-muted-foreground">
                    Click the "Download Chrome Extension" button above and add {COMPANY_NAME} to your Chrome browser
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">Open Your Lovable Project</h3>
                  <p className="text-muted-foreground">
                    Go to{' '}
                    <a 
                      href="https://lovable.dev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      lovable.dev
                    </a>
                    {' '}and open any of your projects
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">Click the "Grow" Button</h3>
                  <p className="text-muted-foreground">
                    Look for the new "Grow" tab in your Lovable navigation bar. Click it to start creating Meta ads with AI!
                  </p>
                </div>
              </div>
            </div>

            {/* Visual indicator */}
            <div className="pt-8 border-t border-border">
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Check className="w-5 h-5 text-green-600" />
                <span>After installation, you'll sign in directly within Lovable</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-background/60 backdrop-blur-sm rounded-xl border border-border p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold">AI-Powered Creation</h3>
              <p className="text-sm text-muted-foreground">
                Generate ad copy and images with AI, optimized for Meta's platform
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur-sm rounded-xl border border-border p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Integrated Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track performance metrics and optimize campaigns without leaving Lovable
              </p>
            </div>

            <div className="bg-background/60 backdrop-blur-sm rounded-xl border border-border p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Quick Setup</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Meta ad account and start publishing ads in minutes
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
                <Chrome className="w-5 h-5" />
                Get the Extension
              </a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm mt-24">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 {COMPANY_NAME}. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

