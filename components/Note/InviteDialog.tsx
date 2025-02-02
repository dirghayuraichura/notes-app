import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface Invitation {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
}

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  noteId: string;
  currentUserId: string;
}

export function InviteDialog({ open, onClose, noteId, currentUserId }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}/invite`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInvitations();
    }
  }, [open, noteId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/notes/${noteId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          invitedBy: currentUserId
        }),
      });

      if (response.ok) {
        toast.success('Invitation sent successfully');
        setEmail('');
        fetchInvitations();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white p-4 max-w-md w-full">
        <DialogTitle>Invite Collaborators</DialogTitle>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Invite</Button>
          </div>
        </form>
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Pending Invitations</h3>
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{invitation.email}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(invitation.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="text-sm text-gray-500">No pending invitations</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 