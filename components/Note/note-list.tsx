import { NoteCard } from "./note-card"
import { Users } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  isOwner: boolean
  owner: {
    email: string
    fullName: string | null
  }
  collaborators: Array<{
    id: string
    email: string
    fullName: string | null
  }>
}

interface NoteListProps {
  notes: Note[]
  onEdit: (id: string) => void
  onDelete?: (id: string) => void
}

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {notes.map((note) => (
        <div key={note.id} className="relative">
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
            {!note.isOwner && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 max-w-[200px]">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Shared by {note.owner.fullName || note.owner.email}</span>
              </div>
            )}
            {note.collaborators.length > 0 && (
              <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {note.collaborators.length} collaborator{note.collaborators.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="mt-8">
            <NoteCard
              id={note.id}
              title={note.title}
              content={note.content}
              onEdit={onEdit}
              onDelete={note.isOwner ? onDelete : undefined}
            />
          </div>
        </div>
      ))}
      {notes.length === 0 && (
        <p className="col-span-full text-center text-gray-500 mt-8">
          No notes found. Create a new note to get started.
        </p>
      )}
    </div>
  )
}

