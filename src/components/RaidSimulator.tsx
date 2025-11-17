import { useState, useEffect } from 'react';
import { raidSimulator, RaidIntensity, RaidStats } from '@/lib/raidSimulation';
import { userPool } from '@/lib/userPool';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Zap, Users, TrendingUp, MessageSquare, X } from 'lucide-react';

interface RaidSimulatorProps {
  onRaidMessage?: (message: string, username: string) => void;
  onClose?: () => void;
}

export const RaidSimulator = ({ onRaidMessage, onClose }: RaidSimulatorProps) => {
  const [raiderCount, setRaiderCount] = useState(30);
  const [raiderUsername, setRaiderUsername] = useState('xQc');
  const [intensity, setIntensity] = useState<RaidIntensity>('medium');
  const [duration, setDuration] = useState(60);
  const [stats, setStats] = useState<RaidStats | null>(null);
  const [isRaidActive, setIsRaidActive] = useState(false);

  useEffect(() => {
    return () => {
      raidSimulator.stopRaid();
    };
  }, []);

  const handleStartRaid = () => {
    // Expand pool if needed
    const poolSize = userPool.getPoolSize();
    const offlineCount = userPool.getUsersByState('offline').length;

    if (raiderCount > offlineCount) {
      const needed = raiderCount - offlineCount + 10; // Add 10 extra buffer
      console.log(`Expanding pool by ${needed} users to accommodate raid`);
      userPool.expandPool(needed);
    }

    // Start raid
    raidSimulator.startRaid(
      {
        raiderCount,
        raiderUsername,
        intensity,
        duration
      },
      (newStats) => {
        setStats(newStats);
        setIsRaidActive(newStats.isActive);
      },
      onRaidMessage
    );

    setIsRaidActive(true);
  };

  const handleStopRaid = () => {
    raidSimulator.stopRaid();
    setIsRaidActive(false);
  };

  const handlePreset = (preset: keyof typeof raidSimulator.presets) => {
    const config = raidSimulator.presets[preset];
    setRaiderCount(config.raiderCount);
    setIntensity(config.intensity);
    setDuration(config.duration);
  };

  const getIntensityColor = (int: RaidIntensity) => {
    switch (int) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'mega': return 'bg-red-500';
    }
  };

  const getIntensityEmoji = (int: RaidIntensity) => {
    switch (int) {
      case 'low': return '🌊';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      case 'mega': return '💥';
    }
  };

  return (
    <div className="bg-[rgb(255,250,235)] rounded-xl border border-[rgba(16,86,82,0.3)] shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(16,86,82,0.2)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
          <span className="text-lg">🎯</span>
          Raid Simulator
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Quick Presets */}
        <div>
          <Label className="text-xs text-foreground font-bold mb-2 block uppercase tracking-wide">
            Quick Presets
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(raidSimulator.presets).map(([name, config]) => (
              <Button
                key={name}
                onClick={() => handlePreset(name as keyof typeof raidSimulator.presets)}
                variant="outline"
                size="sm"
                className="text-xs capitalize border-[rgba(16,86,82,0.3)] hover:bg-[rgba(16,86,82,0.1)] hover:border-[rgba(16,86,82,0.5)]"
                disabled={isRaidActive}
              >
                {name}
                <span className="ml-1 text-[10px] text-muted-foreground">({config.raiderCount})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Raider Username */}
        <div>
          <Label htmlFor="raider-username" className="text-xs text-foreground font-bold mb-2 block uppercase tracking-wide">
            <span className="text-base mr-1">👤</span>
            Raider Username
          </Label>
          <input
            id="raider-username"
            type="text"
            value={raiderUsername}
            onChange={(e) => setRaiderUsername(e.target.value)}
            disabled={isRaidActive}
            className="w-full px-3 py-2 text-sm border border-[rgba(16,86,82,0.3)] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white disabled:opacity-50"
            placeholder="Enter raider username..."
          />
        </div>

        {/* Raider Count Slider */}
        <div>
          <Label htmlFor="raider-count" className="text-xs text-foreground font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
            <span className="text-lg">👥</span>
            Raider Count: <span className="text-accent font-bold">{raiderCount}</span>
          </Label>
          <Slider
            id="raider-count"
            min={5}
            max={150}
            step={5}
            value={[raiderCount]}
            onValueChange={(value) => setRaiderCount(value[0])}
            disabled={isRaidActive}
            className="mt-2"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">Small (5)</span>
            <span className="text-[10px] text-muted-foreground font-medium">Massive (150)</span>
          </div>
        </div>

        {/* Intensity Selector */}
        <div>
          <Label className="text-xs text-foreground font-bold mb-2 block uppercase tracking-wide">
            <span className="text-base mr-1">⚡</span>
            Raid Intensity
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'mega'] as RaidIntensity[]).map((int) => (
              <button
                key={int}
                onClick={() => setIntensity(int)}
                disabled={isRaidActive}
                className={`
                  px-3 py-2 text-xs font-bold rounded-lg border-2 transition-all uppercase
                  ${intensity === int
                    ? `${getIntensityColor(int)} border-transparent text-white shadow-md`
                    : 'bg-white border-[rgba(16,86,82,0.3)] text-foreground hover:border-[rgba(16,86,82,0.5)]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {getIntensityEmoji(int)} {int}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div>
          <Label htmlFor="duration" className="text-xs text-foreground font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
            <span className="text-lg">⏱️</span>
            Duration: <span className="text-accent font-bold">{duration}s</span>
          </Label>
          <Slider
            id="duration"
            min={15}
            max={180}
            step={15}
            value={[duration]}
            onValueChange={(value) => setDuration(value[0])}
            disabled={isRaidActive}
            className="mt-2"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">Quick (15s)</span>
            <span className="text-[10px] text-muted-foreground font-medium">Long (3m)</span>
          </div>
        </div>

        {/* Stats Display (when raid is active) */}
        {stats && stats.isActive && (
          <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
            <Label className="text-xs text-foreground font-bold mb-3 block uppercase tracking-wide">
              <span className="text-base mr-1">📊</span>
              Raid Stats
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-[rgba(16,86,82,0.2)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Joined</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {stats.joinedRaiders}/{stats.totalRaiders}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[rgba(16,86,82,0.2)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Active</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {stats.activatedRaiders}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[rgba(16,86,82,0.2)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Messages</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {stats.messagesGenerated}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-[rgba(16,86,82,0.2)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Progress</span>
                </div>
                <div className="text-lg font-bold text-foreground">
                  {Math.round((stats.joinedRaiders / stats.totalRaiders) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          {!isRaidActive ? (
            <Button
              onClick={handleStartRaid}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wide shadow-md"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Raid
            </Button>
          ) : (
            <Button
              onClick={handleStopRaid}
              variant="destructive"
              className="w-full font-bold uppercase tracking-wide shadow-md"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              Stop Raid
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-[10px] text-muted-foreground text-center space-y-1">
          <p>Simulates a mass user influx from another channel</p>
          <p className="text-accent font-medium">
            Current Pool: {userPool.getPoolSize()} users ({userPool.getUsersByState('offline').length} available)
          </p>
        </div>
      </div>
    </div>
  );
};
