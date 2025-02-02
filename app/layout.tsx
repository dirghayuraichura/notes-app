import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { Toaster } from "react-hot-toast"
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Collaborative Note App",
  description: "A real-time collaborative note-taking application",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}

