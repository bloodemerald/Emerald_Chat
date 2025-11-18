import { useMemo, useCallback } from "react";
import { ChatSettings, PersonalityType } from "@/types/personality";
import { PERSONALITIES } from "@/lib/personalities";
import { CustomSwitch } from "./ui/custom-switch";
import { CustomCheckbox } from "./ui/custom-checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SettingsPanelProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  onTriggerTestRaid?: () => void;
}

export const SettingsPanel = ({ settings, onSettingsChange, onTriggerTestRaid }: SettingsPanelProps) => {
  const totalPersonalities = useMemo(() => Object.keys(PERSONALITIES).length, []);
  const activePersonalities = useMemo(
    () => Object.values(settings.personalities).filter(Boolean).length,
    [settings.personalities]
  );

  const handlePersonalityToggle = useCallback((type: PersonalityType, enabled: boolean) => {
    onSettingsChange({
      ...settings,
      personalities: {
        ...settings.personalities,
        [type]: enabled,
      },
    });
  }, [onSettingsChange, settings]);

  const handleFrequencyChange = useCallback((value: number[]) => {
    onSettingsChange({
      ...settings,
      messageFrequency: value[0],
    });
  }, [onSettingsChange, settings]);

  const handleToggle = useCallback((key: keyof ChatSettings, value: boolean | string) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  }, [onSettingsChange, settings]);

  const handleBulkPersonalityToggle = useCallback((enabled: boolean) => {
    const updatedPersonalities = Object.keys(settings.personalities).reduce((acc, type) => {
      acc[type as PersonalityType] = enabled;
      return acc;
    }, {} as Record<PersonalityType, boolean>);

    onSettingsChange({
      ...settings,
      personalities: updatedPersonalities,
    });
  }, [onSettingsChange, settings]);

  const handleShufflePersonalities = useCallback(() => {
    const entries = Object.keys(settings.personalities) as PersonalityType[];
    const randomized = entries.reduce((acc, type) => {
      acc[type] = Math.random() > 0.35;
      return acc;
    }, {} as Record<PersonalityType, boolean>);

    const enabledCount = Object.values(randomized).filter(Boolean).length;
    if (enabledCount < 3) {
      entries.slice(0, 3).forEach((type) => {
        randomized[type] = true;
      });
    }

    onSettingsChange({
      ...settings,
      personalities: randomized,
    });
  }, [onSettingsChange, settings]);

  const diversityOptions: { label: string; value: ChatSettings["diversityLevel"]; description: string }[] = useMemo(() => ([
    { label: "Low", value: "low", description: "Focused voices" },
    { label: "Medium", value: "medium", description: "Balanced banter" },
    { label: "High", value: "high", description: "Max chaos" },
  ]), []);

  const handleAISelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'local' | 'cloud' | 'auto';
    handleToggle('aiProvider', value);
  };

  return (
    <div className="bg-[rgb(255,250,235)] rounded-xl border border-[rgba(16,86,82,0.3)] shadow-md">
      <div className="p-5 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">🎭</span>
            Chat Personalities
          </h3>
          <div className="flex flex-col gap-2 rounded-lg border border-[rgba(16,86,82,0.15)] bg-white/60 p-3 text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-foreground">
                {activePersonalities} / {totalPersonalities} active
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleBulkPersonalityToggle(true)}
                  className="rounded border border-border px-2 py-1 font-semibold text-[10px] uppercase tracking-wide hover:bg-primary/10"
                >
                  Enable All
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkPersonalityToggle(false)}
                  className="rounded border border-border px-2 py-1 font-semibold text-[10px] uppercase tracking-wide hover:bg-destructive/10"
                >
                  Disable All
                </button>
                <button
                  type="button"
                  onClick={handleShufflePersonalities}
                  className="rounded border border-[rgba(128,90,213,0.4)] px-2 py-1 font-semibold text-[10px] uppercase tracking-wide text-purple-700 hover:bg-purple-50"
                >
                  Shuffle Mix
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Use quick actions to experiment with different viewer vibes before fine-tuning below.
            </p>
          </div>
          <div className="space-y-1 pl-2">
            {Object.entries(PERSONALITIES).map(([type, personality]) => (
              <CustomCheckbox
                key={type}
                id={type}
                label={`${personality.emoji} ${personality.name}`}
                checked={settings.personalities[type as PersonalityType]}
                onCheckedChange={(checked) => handlePersonalityToggle(type as PersonalityType, checked)}
              />
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">🌈</span>
            Personality Mix
          </h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            Control how adventurous the personalities should get during the stream.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {diversityOptions.map((option) => {
              const isActive = settings.diversityLevel === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle('diversityLevel', option.value)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border bg-white/80 text-foreground hover:border-primary/40'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="block text-xs font-semibold uppercase tracking-wide">{option.label}</span>
                  <span className="text-[10px] text-muted-foreground">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <Label htmlFor="frequency" className="text-xs text-foreground font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
            <span className="text-lg">⏱️</span>
            Message Frequency: <span className="text-accent font-bold">{settings.messageFrequency}s</span>
          </Label>
          <Slider
            id="frequency"
            min={2}
            max={10}
            step={1}
            value={[settings.messageFrequency]}
            onValueChange={handleFrequencyChange}
            className="mt-2"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground font-medium">Fast (2s)</span>
            <span className="text-[10px] text-muted-foreground font-medium">Slow (10s)</span>
          </div>
        </div>


        {/* Chat Options */}
        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">⚙️</span>
            Chat Options
          </h3>

          {/* Show Timestamps */}
          <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
            <Label htmlFor="show-timestamps" className="text-xs flex items-center gap-2 text-foreground cursor-pointer font-medium">
              <span className="text-base">🕐</span>
              <span>Show Timestamps</span>
            </Label>
            <CustomSwitch
              id="show-timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={(checked) => handleToggle('showTimestamps', checked)}
            />
          </div>

          {/* Pause on Scroll */}
          <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
            <Label htmlFor="pause-scroll" className="text-xs flex items-center gap-2 text-foreground cursor-pointer">
              <span className="text-base">⏸️</span>
              <div>
                <span className="font-medium">Pause on Scroll</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Auto-scroll pauses when scrolling up</p>
              </div>
            </Label>
            <CustomSwitch
              id="pause-scroll"
              checked={settings.pauseOnScroll}
              onCheckedChange={(checked) => handleToggle('pauseOnScroll', checked)}
            />
          </div>

          {/* AutoMod */}
          <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)]">
            <Label htmlFor="automod" className="text-xs flex items-center gap-2 text-foreground cursor-pointer">
              <span className="text-base">🛡️</span>
              <div>
                <span className="font-medium">AutoMod Filter</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Filter toxic/inappropriate messages</p>
              </div>
            </Label>
            <CustomSwitch
              id="automod"
              checked={settings.enableAutoMod}
              onCheckedChange={(checked) => handleToggle('enableAutoMod', checked)}
            />
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">😊</span>
            Sentiment Analysis
          </h3>

          {/* Enable Sentiment Analysis */}
          <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
            <Label htmlFor="enable-sentiment" className="text-xs flex items-center gap-2 text-foreground cursor-pointer">
              <span className="text-base">🔍</span>
              <div>
                <span className="font-medium">Enable Sentiment Analysis</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Analyze message tone and emotion</p>
              </div>
            </Label>
            <CustomSwitch
              id="enable-sentiment"
              checked={settings.enableSentimentAnalysis}
              onCheckedChange={(checked) => handleToggle('enableSentimentAnalysis', checked)}
            />
          </div>

          {/* Show Sentiment Indicators */}
          {settings.enableSentimentAnalysis && (
            <>
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
                <Label htmlFor="show-sentiment" className="text-xs flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <span className="text-base">🏷️</span>
                  <span>Show Sentiment Indicators</span>
                </Label>
                <CustomSwitch
                  id="show-sentiment"
                  checked={settings.showSentimentIndicators}
                  onCheckedChange={(checked) => handleToggle('showSentimentIndicators', checked)}
                />
              </div>

              {/* Highlight Positive Messages */}
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
                <Label htmlFor="highlight-positive" className="text-xs flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <span className="text-base">✨</span>
                  <span>Highlight Positive Messages</span>
                </Label>
                <CustomSwitch
                  id="highlight-positive"
                  checked={settings.highlightPositive}
                  onCheckedChange={(checked) => handleToggle('highlightPositive', checked)}
                />
              </div>

              {/* Highlight Negative Messages */}
              <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)] mb-2">
                <Label htmlFor="highlight-negative" className="text-xs flex items-center gap-2 text-foreground cursor-pointer font-medium">
                  <span className="text-base">⚠️</span>
                  <span>Highlight Negative Messages</span>
                </Label>
                <CustomSwitch
                  id="highlight-negative"
                  checked={settings.highlightNegative}
                  onCheckedChange={(checked) => handleToggle('highlightNegative', checked)}
                />
              </div>

              {/* Sentiment Filter */}
              <div className="p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)]">
                <Label htmlFor="sentiment-filter" className="text-xs font-medium text-foreground mb-2 block">
                  Filter by Sentiment
                </Label>
                <select
                  id="sentiment-filter"
                  value={settings.sentimentFilter || 'all'}
                  onChange={(e) => handleToggle('sentimentFilter', e.target.value as 'all' | 'positive' | 'negative' | 'neutral')}
                  className="w-full text-xs bg-white border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Messages</option>
                  <option value="positive">Positive Only</option>
                  <option value="negative">Negative Only</option>
                  <option value="neutral">Neutral Only</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Filter messages based on sentiment analysis
                </p>
              </div>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">🤖</span>
            AI Provider
          </h3>
          <div className="p-2.5 rounded-lg hover:bg-[rgba(16,86,82,0.05)] transition-colors border border-transparent hover:border-[rgba(16,86,82,0.2)]">
            <select
              id="ai-provider"
              value={settings.aiProvider}
              onChange={handleAISelectChange}
              className="w-full text-xs bg-white border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="auto">Auto (Local first)</option>
              <option value="local">Local AI Only</option>
              <option value="cloud">Cloud AI Only</option>
            </select>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              'Auto' will use Local AI if available, otherwise it will use the cloud.
            </p>
          </div>

          {(settings.aiProvider === 'auto' || settings.aiProvider === 'local') && (
            <div className="mt-4 pl-10 pr-4 space-y-3">
              <div>
                <Label htmlFor="ollama-model" className="text-xs font-medium text-muted-foreground">Ollama Model</Label>
                <input
                  id="ollama-model"
                  type="text"
                  value={settings.ollamaModel || ''}
                  onChange={(e) => handleToggle('ollamaModel', e.target.value)}
                  placeholder="llava:13b (default)"
                  className="mt-1 w-full text-xs bg-white border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="ollama-api-url" className="text-xs font-medium text-muted-foreground">Ollama API URL (Optional)</Label>
                <input
                  id="ollama-api-url"
                  type="text"
                  value={settings.ollamaApiUrl || ''}
                  onChange={(e) => handleToggle('ollamaApiUrl', e.target.value)}
                  placeholder="e.g., http://localhost:11434"
                  className="mt-1 w-full text-xs bg-white border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-[10px] text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
                💡 <strong>Tip:</strong> For better vision understanding, try <code className="bg-white px-1 rounded">llava:13b</code> or <code className="bg-white px-1 rounded">llava:34b</code><br/>
                Run: <code className="bg-white px-1 rounded">ollama pull llava:13b</code>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Make sure Ollama is running and the model is downloaded.
              </p>
            </div>
          )}
        </div>

        {/* Testing & Simulation */}
        <div className="pt-3 border-t border-[rgba(16,86,82,0.2)]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-lg">🚨</span>
            Testing & Simulation
          </h3>

          <div className="p-2.5 rounded-lg bg-[rgba(16,86,82,0.05)] border border-[rgba(16,86,82,0.2)]">
            <button
              onClick={onTriggerTestRaid}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              🎯 Trigger Test Raid
            </button>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Simulates a raid with 10-25 random users joining rapidly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
