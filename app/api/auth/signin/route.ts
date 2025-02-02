import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      console.log("Invalid credentials")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Store user ID in a cookie
    cookies().set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword, message: "Sign in successful" })
  } catch (error) {
    console.error("Error during sign in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

