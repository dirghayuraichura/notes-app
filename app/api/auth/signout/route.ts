import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear the userId cookie
    cookies().delete("userId")

    return NextResponse.json({ message: "Signed out successfully" })
  } catch (error) {
    console.error("Error during sign out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 