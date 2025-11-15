import { ChatSettings, PersonalityType } from "@/types/personality";
import { PERSONALITIES } from "@/lib/personalities";
import { CustomSwitch } from "./ui/custom-switch";
import { CustomCheckbox } from "./ui/custom-checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SettingsPanelProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export const SettingsPanel = ({ settings, onSettingsChange }: SettingsPanelProps) => {
  const handlePersonalityToggle = (type: PersonalityType, enabled: boolean) => {
    onSettingsChange({
      ...settings,
      personalities: {
        ...settings.personalities,
        [type]: enabled,
      },
    });
  };

  const handleFrequencyChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      messageFrequency: value[0],
    });
  };


  const handleToggle = (key: keyof ChatSettings, value: boolean | string) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

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
      </div>
    </div>
  );
};
