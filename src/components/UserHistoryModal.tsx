import React, { useMemo, useState } from 'react';
import { Message } from '@/types/personality';
import { ChatUser } from '@/lib/userPool';
import { getUserModActions, getTimeoutRemaining } from '@/lib/moderation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MessageSquare, Clock, Ban, AlertTriangle, Search } from 'lucide-react';

interface UserHistoryModalProps {
  user: ChatUser | null;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  user,
  messages,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter messages by this user
  const userMessages = useMemo(() => {
    if (!user) return [];
    return messages.filter(msg => msg.username === user.username);
  }, [user, messages]);

  // Filter by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return userMessages;
    const query = searchQuery.toLowerCase();
    return userMessages.filter(msg =>
      msg.message.toLowerCase().includes(query)
    );
  }, [userMessages, searchQuery]);

  // Get moderation actions
  const modActions = useMemo(() => {
    if (!user) return [];
    return getUserModActions(user.username);
  }, [user]);

  const timeoutRemaining = user ? getTimeoutRemaining(user.username) : null;

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-500" />
            Message History: {user.username}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            All messages from this user in the current session
          </DialogDescription>
        </DialogHeader>

        {/* User Stats */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-500">
              {userMessages.length}
            </div>
            <div className="text-xs text-gray-400">Total Messages</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-500">
              {user.likesGiven}
            </div>
            <div className="text-xs text-gray-400">Likes Given</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-500">
              {modActions.length}
            </div>
            <div className="text-xs text-gray-400">Mod Actions</div>
          </div>
        </div>

        {/* Moderation Status */}
        {(user.moderation.isBanned || user.moderation.isTimedOut || user.moderation.warnings > 0) && (
          <div className="space-y-2">
            {user.moderation.isBanned && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 rounded-lg p-3">
                <Ban className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <div className="font-semibold text-red-500">BANNED</div>
                  {user.moderation.banReason && (
                    <div className="text-sm text-gray-400">Reason: {user.moderation.banReason}</div>
                  )}
                </div>
              </div>
            )}

            {user.moderation.isTimedOut && (
              <div className="flex items-center gap-2 bg-orange-900/30 border border-orange-700 rounded-lg p-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-500">
                    TIMED OUT {timeoutRemaining && `(${timeoutRemaining} remaining)`}
                  </div>
                  {user.moderation.timeoutReason && (
                    <div className="text-sm text-gray-400">Reason: {user.moderation.timeoutReason}</div>
                  )}
                </div>
              </div>
            )}

            {user.moderation.warnings > 0 && !user.moderation.isBanned && !user.moderation.isTimedOut && (
              <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-semibold text-yellow-500">
                    {user.moderation.warnings} WARNING{user.moderation.warnings > 1 ? 'S' : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Messages List */}
        <ScrollArea className="flex-1 pr-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No messages match your search' : 'No messages yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs text-gray-500">{msg.timestamp}</div>
                    {msg.likes && msg.likes > 0 && (
                      <Badge variant="outline" className="text-xs border-pink-700 text-pink-400">
                        ❤️ {msg.likes}
                      </Badge>
                    )}
                  </div>
                  <div className="text-white">{msg.message}</div>
                  {msg.replyToUsername && (
                    <div className="mt-2 text-xs text-gray-500 border-l-2 border-purple-600 pl-2">
                      Reply to {msg.replyToUsername}: {msg.replyToMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Moderation History */}
        {modActions.length > 0 && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <div className="text-sm font-semibold text-gray-400 mb-2">Moderation History</div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                {modActions.slice(-10).reverse().map((action) => (
                  <div key={action.id} className="text-xs text-gray-500">
                    <span className={
                      action.type === 'ban' ? 'text-red-500' :
                      action.type === 'timeout' ? 'text-orange-500' :
                      'text-yellow-500'
                    }>
                      {action.type.toUpperCase()}
                    </span>
                    {' '}by {action.moderatorUsername}
                    {action.reason && ` - ${action.reason}`}
                    {' '}({new Date(action.timestamp).toLocaleTimeString()})
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserHistoryModal;
