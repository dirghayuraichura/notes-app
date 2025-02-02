import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface Collaborator {
  id: string;
  email: string;
  fullName: string | null;
}

interface CollaboratorDialogProps {
  open: boolean;
  onClose: () => void;
  noteId: string;
}

export function CollaboratorDialog({ open, onClose, noteId }: CollaboratorDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCollaborators();
    }
  }, [open, noteId]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to add collaborator');
      }

      toast.success('Collaborator added successfully');
      setEmail('');
      fetchCollaborators();
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/collaborators/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove collaborator');
      }

      toast.success('Collaborator removed successfully');
      fetchCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddCollaborator} className="space-y-4">
          <div>
            <Label htmlFor="email">Add by Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
              <Button type="submit" disabled={isLoading}>
                Add
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-4">
          <Label>Current Collaborators</Label>
          <div className="space-y-2 mt-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">
                      {collaborator.fullName || collaborator.email}
                    </div>
                    <div className="text-xs text-gray-500">{collaborator.email}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {collaborators.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                No collaborators yet
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 