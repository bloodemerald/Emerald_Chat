import React, { useState } from 'react';
import { Message } from '@/types/personality';
import { TimeoutDuration, TIMEOUT_DURATIONS } from '@/types/moderation';
import { banUser, timeoutUser, warnUser } from '@/lib/moderation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Ban, Clock, AlertTriangle, User, MessageSquare } from 'lucide-react';

interface ModeratorControlsProps {
  message: Message;
  onViewHistory: (username: string) => void;
  onViewProfile: (username: string) => void;
  children: React.ReactNode;
}

export const ModeratorControls: React.FC<ModeratorControlsProps> = ({
  message,
  onViewHistory,
  onViewProfile,
  children
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'ban' | 'timeout' | 'warn' | null;
    duration?: TimeoutDuration;
  }>({ type: null });
  const [reason, setReason] = useState('');

  const handleBan = () => {
    if (message.isModerator) return; // Can't ban moderator
    setConfirmDialog({ type: 'ban' });
  };

  const handleTimeout = (duration: TimeoutDuration) => {
    if (message.isModerator) return;
    setConfirmDialog({ type: 'timeout', duration });
  };

  const handleWarn = () => {
    if (message.isModerator) return;
    setConfirmDialog({ type: 'warn' });
  };

  const confirmAction = () => {
    const username = message.username;

    switch (confirmDialog.type) {
      case 'ban':
        banUser(username, reason || undefined);
        break;
      case 'timeout':
        if (confirmDialog.duration) {
          timeoutUser(username, confirmDialog.duration, reason || undefined);
        }
        break;
      case 'warn':
        warnUser(username, reason || undefined);
        break;
    }

    setConfirmDialog({ type: null });
    setReason('');
  };

  const cancelAction = () => {
    setConfirmDialog({ type: null });
    setReason('');
  };

  const getDialogTitle = () => {
    switch (confirmDialog.type) {
      case 'ban':
        return `Ban ${message.username}?`;
      case 'timeout':
        return `Timeout ${message.username}?`;
      case 'warn':
        return `Warn ${message.username}?`;
      default:
        return '';
    }
  };

  const getDialogDescription = () => {
    switch (confirmDialog.type) {
      case 'ban':
        return 'This user will be permanently banned and removed from chat.';
      case 'timeout': {
        const duration = confirmDialog.duration;
        return `This user will be timed out for ${duration} and temporarily removed from chat.`;
      }
      case 'warn':
        return 'This user will receive a warning. Multiple warnings may result in automatic timeout.';
      default:
        return '';
    }
  };

  // Don't show mod controls for moderator messages
  if (message.isModerator) {
    return <>{children}</>;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
          <DropdownMenuItem
            onClick={() => onViewProfile(message.username)}
            className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onViewHistory(message.username)}
            className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>View Message History</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-700" />

          <DropdownMenuItem
            onClick={handleWarn}
            className="text-yellow-400 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Warn User</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-orange-400 hover:bg-gray-800 focus:bg-gray-800">
              <Clock className="mr-2 h-4 w-4" />
              <span>Timeout</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-gray-900 border-gray-700">
              {(Object.keys(TIMEOUT_DURATIONS) as TimeoutDuration[]).map((duration) => (
                <DropdownMenuItem
                  key={duration}
                  onClick={() => handleTimeout(duration)}
                  className="text-white hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                >
                  {duration}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-gray-700" />

          <DropdownMenuItem
            onClick={handleBan}
            className="text-red-400 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
          >
            <Ban className="mr-2 h-4 w-4" />
            <span>Ban User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDialog.type !== null} onOpenChange={(open) => !open && cancelAction()}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{getDialogTitle()}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-white">
                Reason (optional)
              </Label>
              <Input
                id="reason"
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelAction}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={
                confirmDialog.type === 'ban'
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmDialog.type === 'timeout'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModeratorControls;
