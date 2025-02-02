import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users } from "lucide-react"
import { CollaboratorDialog } from "./CollaboratorDialog"
import io from 'socket.io-client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"

interface Note {
  id: string
  title: string
  content: string
  category?: string
  version?: number
}

interface User {
  id: string
  email: string
  fullName: string | null
}

interface CursorPosition {
  userId: string
  position: { x: number; y: number }
  userInfo: {
    email: string
    fullName: string | null
  }
}

interface EditNoteDialogProps {
  note: {
    id: string;
    title: string;
    content: string;
    category?: string;
    isOwner: boolean;
  };
  onEdit: (data: { title: string; content: string; category?: string }) => void;
  open: boolean;
  onClose: () => void;
  currentUser: User;
}

export function EditNoteDialog({ note, onEdit, open, onClose, currentUser }: EditNoteDialogProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category || '');
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const [socket, setSocket] = useState<any>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open && note.id && currentUser) {
      const socketInstance = io('', {
        path: '/api/socket'
      });

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket');
        socketInstance.emit('join-note', {
          noteId: note.id,
          user: currentUser
        });
      });

      socketInstance.on('active-users', ({ users }) => {
        setActiveUsers(users);
      });

      socketInstance.on('user-typing', ({ userId, userName }) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: userName
        }));
        // Clear typing indicator after 2 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
        }, 2000);
      });

      socketInstance.on('note-updated', ({ title: newTitle, content: newContent, userId }) => {
        if (userId !== currentUser.id) {
          setTitle(newTitle);
          setContent(newContent);
        }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.emit('leave-note', {
          noteId: note.id,
          user: currentUser
        });
        socketInstance.disconnect();
      };
    }
  }, [open, note.id, currentUser]);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || '');
  }, [note]);

  const emitTyping = () => {
    if (socket && currentUser) {
      socket.emit('typing', {
        noteId: note.id,
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.email
      });
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Emit typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping();
    
    // Emit content update
    if (socket) {
      socket.emit('note-update', {
        noteId: note.id,
        title,
        content: newContent
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Emit typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping();
    
    // Emit title update
    if (socket) {
      socket.emit('note-update', {
        noteId: note.id,
        title: newTitle,
        content
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit({ title, content, category });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Edit Note</DialogTitle>
              <div className="flex items-center gap-4">
                {/* Active Users */}
                <div className="flex -space-x-2">
                  {activeUsers.map((user) => (
                    <TooltipProvider key={user.id}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarFallback>
                              {user.fullName?.[0] || user.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.fullName || user.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                {note.isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollaboratorDialogOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {/* Typing Indicators */}
            {Object.entries(typingUsers).length > 0 && (
              <div className="text-sm text-muted-foreground">
                {Object.values(typingUsers).join(", ")} typing...
              </div>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  ref={contentRef}
                  id="content"
                  value={content}
                  onChange={handleContentChange}
                  required
                  className="h-32"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {note.isOwner && (
        <CollaboratorDialog
          open={isCollaboratorDialogOpen}
          onClose={() => setIsCollaboratorDialogOpen(false)}
          noteId={note.id}
        />
      )}
    </>
  );
}

