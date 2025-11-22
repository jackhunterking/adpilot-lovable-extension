import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

/**
 * DELETE /api/v1/user/delete
 * Deletes the authenticated user's account and all associated data
 * 
 * ⚠️ BACKEND OPERATION - Requires Supabase Admin privileges
 * 
 * Security:
 * - Uses cookie-based authentication
 * - Requires valid user session
 * - Uses service role key for admin operations
 * 
 * Cascade Deletion:
 * - All campaigns, ads, and related data deleted automatically
 * - Meta connections and tokens deleted
 * - Conversations and messages deleted
 * - See docs/SUPABASE_AUTH_VERIFICATION.md for full details
 */
export async function DELETE() {
  try {
    // Get user from session cookies
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Create client with cookies for auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      )
    }

    // Use admin client to delete user
    // Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not configured")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete user (cascade will handle related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return NextResponse.json(
        { error: "Failed to delete account. Please try again or contact support." },
        { status: 500 }
      )
    }

    // Success - user and all data deleted
    return NextResponse.json(
      { 
        success: true, 
        message: "Account deleted successfully" 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in DELETE /api/v1/user/delete:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

