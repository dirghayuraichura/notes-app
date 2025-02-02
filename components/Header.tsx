"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { InviteDialog } from "@/components/Note/InviteDialog"
import { useState } from "react"

interface HeaderProps {
  username: string
  onLogout: () => void
  onInviteUsers: () => void
  currentUserId: string
  currentNoteId?: string
}

export function Header({ username, onLogout, currentUserId, currentNoteId }: HeaderProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Notes App</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="flex items-center space-x-2">
            <span>{username}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentNoteId && (
            <DropdownMenuItem onClick={() => setIsInviteDialogOpen(true)}>Invite Users</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {currentNoteId && (
        <InviteDialog
          open={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          noteId={currentNoteId}
          currentUserId={currentUserId}
        />
      )}
    </header>
  )
}