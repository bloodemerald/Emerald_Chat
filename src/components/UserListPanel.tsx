import { useState, useMemo } from "react";
import { X, Search, Users } from "lucide-react";
import { ChatUser } from "@/lib/userPool";
import { BadgeList } from "./badges/BadgeList";
import { PERSONALITIES } from "@/lib/personalities";

interface UserListPanelProps {
  users: ChatUser[];
  isOpen: boolean;
  onClose: () => void;
  onUserClick?: (user: ChatUser) => void;
}

export const UserListPanel = ({ users, isOpen, onClose, onUserClick }: UserListPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort users
  const sortedUsers = useMemo(() => {
    const filtered = users.filter((user) =>
      (user.state === 'active' || user.state === 'lurking') &&
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort: moderators first, then by message count (most active)
    filtered.sort((a, b) => {
      // Check if users have moderator badge
      const aIsMod = a.badges.some(badge => badge.type === 'moderator');
      const bIsMod = b.badges.some(badge => badge.type === 'moderator');
      
      if (aIsMod && !bIsMod) return -1;
      if (!aIsMod && bIsMod) return 1;
      
      // Sort by message count
      return b.messageCount - a.messageCount;
    });

    return filtered;
  }, [users, searchQuery]);

  const activeCount = users.filter(u => u.state === 'active').length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-gray-200/70 shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/70 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold text-sm text-gray-900">Viewers</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200/70">
                {activeCount}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
              aria-label="Close user list"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search viewers..."
              className="w-full bg-gray-50 text-gray-900 placeholder:text-gray-400 rounded-lg pl-10 pr-3 py-2 text-sm border border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto h-[calc(100vh-160px)] p-3">
          {sortedUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No viewers found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedUsers.map((user) => {
                const personality = PERSONALITIES[user.personality];
                const isModerator = user.badges.some(badge => badge.type === 'moderator');

                return (
                  <button
                    key={user.id}
                    onClick={() => onUserClick?.(user)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="text-2xl">{user.avatarEmoji}</div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        {/* Username & Badges */}
                        <div className="flex items-center gap-2 mb-1">
                          {user.badges.length > 0 && (
                            <BadgeList badges={user.badges} size="xs" maxDisplay={2} />
                          )}
                          <span 
                            className="font-semibold text-sm truncate"
                            style={{ color: isModerator ? 'hsl(var(--primary))' : user.profileColor }}
                          >
                            {user.username}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className={`${personality?.emoji || '💬'}`} />
                            {personality?.name}
                          </span>
                          {user.messageCount > 0 && (
                            <span>
                              💬 {user.messageCount}
                            </span>
                          )}
                          {user.subscriberMonths > 0 && (
                            <span className="text-purple-600 font-semibold">
                              ⭐ {user.subscriberMonths}mo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Chevron on hover */}
                      <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span>{sortedUsers.length} active</span>
            <span className="text-green-600 font-semibold">● LIVE</span>
          </div>
        </div>
      </div>
    </>
  );
};
