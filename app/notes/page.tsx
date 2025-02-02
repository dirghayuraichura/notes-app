"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { NoteList } from "@/components/Note/note-list"
import CreateNoteDialog from "@/components/Note/CreateNote"
import { EditNoteDialog } from "@/components/Note/edit-note-dialog"
import toast from 'react-hot-toast';

type Note = {
  id: string
  title: string
  content: string
  category?: string
  userId: string
  createdAt: string
  updatedAt: string
  version?: number
  isOwner: boolean
  owner: string
  collaborators?: string[]
  user: {
    email: string
    fullName: string | null
  }
  team?: {
    members: {
      user: {
        id: string
        email: string
        fullName: string | null
      }
    }[]
  }
}

type User = {
  id: string
  email: string
  fullName: string | null
}

// This type matches what the NoteList component expects
type SimpleNote = {
  id: string
  title: string
  content: string
  version?: number
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [sharedNotes, setSharedNotes] = useState<Note[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/user")
      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }
      const userData = await response.json()
      setUser(userData)
      return userData
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/signin")
    }
  }

  const fetchNotes = async (userId: string) => {
    try {
      const [ownedResponse, sharedResponse] = await Promise.all([
        fetch(`/api/notes?userId=${userId}`),
        fetch(`/api/notes/shared?userId=${userId}`)
      ]);

      if (!ownedResponse.ok || !sharedResponse.ok) {
        throw new Error("Failed to fetch notes")
      }

      const ownedNotes = await ownedResponse.json()
      const sharedNotesList = await sharedResponse.json()

      setNotes(ownedNotes)
      setSharedNotes(sharedNotesList)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Failed to fetch notes")
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      const userData = await fetchUser()
      if (userData?.id) {
        await fetchNotes(userData.id)
      }
    }
    initializeData()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST"
      })
      if (response.ok) {
        setUser(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleCreateButtonClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateNote = async (data: { title: string; content: string; category?: string }) => {
    if (!user) return;

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      await fetchNotes(user.id);
      setIsCreateDialogOpen(false);
      toast.success("Note created successfully");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleUpdateNote = async (noteId: string, data: { title: string; content: string; category?: string }) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      await fetchNotes(user.id);
      setIsEditDialogOpen(false);
      setSelectedNote(null);
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      // Fetch fresh notes to ensure correct order
      await fetchNotes(user.id)
      toast.success("Note deleted successfully")
    } catch (error) {
      console.error("Error deleting note:", error)
      toast.error("Failed to delete note. Please try again.")
    }
  }

  const handleEditNote = async (id: string) => {
    const note = notes.find(n => n.id === id) || sharedNotes.find(n => n.id === id);
    if (note) {
      setSelectedNote(note);
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        username={user?.fullName || user?.email || "Guest"} 
        onLogout={handleLogout}
        currentUserId={user?.id || ""}
        currentNoteId={selectedNote?.id}
        onInviteUsers={() => {}}
      />
      <main className="flex-grow container mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notes</h1>
          <Button onClick={handleCreateButtonClick}>Create Note</Button>
        </div>

        <Tabs defaultValue="my-notes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="my-notes">My Notes</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          </TabsList>

          <TabsContent value="my-notes">
            <NoteList
              notes={notes.map(note => ({
                id: note.id,
                title: note.title,
                content: note.content,
                isOwner: true,
                owner: {
                  email: note.user.email,
                  fullName: note.user.fullName
                },
                collaborators: note.team?.members.map(member => ({
                  id: member.user.id,
                  email: member.user.email,
                  fullName: member.user.fullName
                })) || []
              }))}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          </TabsContent>

          <TabsContent value="shared">
            <NoteList
              notes={sharedNotes.map(note => ({
                id: note.id,
                title: note.title,
                content: note.content,
                isOwner: false,
                owner: {
                  email: note.user.email,
                  fullName: note.user.fullName
                },
                collaborators: note.team?.members.map(member => ({
                  id: member.user.id,
                  email: member.user.email,
                  fullName: member.user.fullName
                })) || []
              }))}
              onEdit={handleEditNote}
            />
          </TabsContent>
        </Tabs>

        <CreateNoteDialog
          onCreate={handleCreateNote}
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
        {selectedNote && user && (
          <EditNoteDialog
            note={selectedNote}
            onEdit={(data) => handleUpdateNote(selectedNote.id, data)}
            open={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedNote(null);
            }}
            currentUser={user}
          />
        )}
      </main>
    </div>
  )
}

