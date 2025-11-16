import { X, Calendar, MessageSquare, Heart, Trophy } from "lucide-react";
import { ChatUser } from "@/lib/userPool";
import { BadgeList } from "./badges/BadgeList";
import { PERSONALITIES } from "@/lib/personalities";

interface UserProfileModalProps {
  user: ChatUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ user, isOpen, onClose }: UserProfileModalProps) => {
  if (!isOpen || !user) return null;

  const personality = PERSONALITIES[user.personality];
  const isModerator = user.badges.some(badge => badge.type === 'moderator');
  const isVIP = user.badges.some(badge => badge.type === 'vip');
  const isFounder = user.badges.some(badge => badge.type === 'founder');

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const joinedDaysAgo = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

  const headerGradient = isModerator
    ? 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.9))'
    : `linear-gradient(135deg, ${user.profileColor}dd, ${user.profileColor}88)`;

  const featuredBadges = user.badges.slice(0, 3);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ perspective: '1200px' }}
      >
        {/* Modal */}
        <div 
          className="bg-white/95 backdrop-blur-xl border border-gray-200/70 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transform-gpu transition-transform hover:-translate-y-1 hover:shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient background */}
          <div 
            className="relative h-32"
            style={{
              background: headerGradient
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar positioned to overlap */}
            <div className="absolute -bottom-12 left-6">
              <div 
                className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center text-5xl border-4 border-white"
                style={{ borderColor: user.profileColor }}
              >
                {user.avatarEmoji}
              </div>
              {/* Online indicator */}
              {user.state === 'active' && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pt-16 px-6 pb-6">
            {/* Username and Badges */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {user.badges.length > 0 && (
                  <BadgeList badges={user.badges} size="md" maxDisplay={10} />
                )}
              </div>
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: isModerator ? 'hsl(var(--primary))' : user.profileColor }}
              >
                {user.username}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  {personality.emoji} {personality.name}
                </span>
                {isModerator && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-secondary text-white rounded text-xs font-bold">
                    MODERATOR
                  </span>
                )}
                {isVIP && (
                  <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-bold">
                    VIP
                  </span>
                )}
                {isFounder && (
                  <span className="px-2 py-0.5 bg-yellow-600 text-white rounded text-xs font-bold">
                    FOUNDER
                  </span>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">"{user.bio}"</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Messages */}
              <div className="rounded-lg border border-gray-200/70 bg-white/80 px-3 py-2.5 flex flex-col gap-1 transition-all duration-150 hover:bg-white hover:shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span>Messages</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">{user.messageCount}</p>
              </div>

              {/* Likes Given */}
              <div className="rounded-lg border border-gray-200/70 bg-white/80 px-3 py-2.5 flex flex-col gap-1 transition-all duration-150 hover:bg-white hover:shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Likes given</span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 tabular-nums">{user.likesGiven}</p>
              </div>

              {/* Subscriber Months */}
              {user.subscriberMonths > 0 && (
                <div className="rounded-lg border border-gray-200/70 bg-white/80 px-3 py-2.5 flex flex-col gap-1 transition-all duration-150 hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-purple-400" />
                      <span>Subscriber</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 tabular-nums">{user.subscriberMonths}mo</p>
                </div>
              )}

              {/* Bits */}
              {user.bits > 0 && (
                <div className="rounded-lg border border-gray-200/70 bg-white/80 px-3 py-2.5 flex flex-col gap-1 transition-all duration-150 hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">💎</span>
                      <span>Bits</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 tabular-nums">{user.bits.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
              <div className="text-gray-500 text-xs">
                Joined {joinedDaysAgo} {joinedDaysAgo === 1 ? 'day' : 'days'} ago
              </div>
              {user.favoriteTeam && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🏆</span>
                  <span>Favorite: {user.favoriteTeam}</span>
                </div>
              )}
            </div>

            {/* Activity Level Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Activity Level</span>
                <span>{Math.round(user.activityLevel * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${user.activityLevel * 100}%` }}
                />
              </div>
            </div>

            {/* Featured Badges Row - subtle 3D-inspired icons */}
            {featuredBadges.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-2 transform-gpu">
                  {featuredBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-sm transition-transform duration-150 hover:-translate-y-0.5"
                      title={badge.name}
                    >
                      <span className="select-none">
                        {badge.icon}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 font-medium">
                  {user.badges.length} badge{user.badges.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
