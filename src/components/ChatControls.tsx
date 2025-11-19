import { Button } from "@/components/ui/button";
import { Camera, Square, Play, Settings, ExternalLink, Trash2, Loader2, Download, Swords } from "lucide-react";
import { useRaidBossStore } from "@/lib/raidBossStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SettingsMenu } from "./SettingsMenu";
import { useState } from "react";
import CyberRadioButton from "./CyberRadioButton";
import CyberExpandButton from "./CyberExpandButton";

interface ChatControlsProps {
  hasScreenshot: boolean;
  isGenerating: boolean;
  isPopoutOpen: boolean;
  isLoadingMessages?: boolean;
  hasMessages?: boolean;
  onCaptureScreen: () => void;
  onStartGenerating: () => void;
  onStopGenerating: () => void;
  onToggleSettings: () => void;
  onOpenPopout: () => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
}

export const ChatControls = ({
  hasScreenshot,
  isGenerating,
  isPopoutOpen,
  isLoadingMessages = false,
  hasMessages = false,
  onCaptureScreen,
  onStartGenerating,
  onStopGenerating,
  onToggleSettings,
  onOpenPopout,
  onClearChat,
  onExportChat,
}: ChatControlsProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'capture' | 'start' | 'stop' | null>(null);

  const handleExportTxt = () => {
    if (onExportChat) {
      onExportChat();
      setMenuOpen(false);
    }
  };

  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat();
      setMenuOpen(false);
    }
  };

  const handleToggleSettings = () => {
    onToggleSettings();
    setMenuOpen(false);
  };

  const handleCapture = () => {
    setActiveButton('capture');
    onCaptureScreen();
  };

  const handleStart = () => {
    if (!hasScreenshot || isGenerating) return;
    setActiveButton('start');
    onStartGenerating();
  };

  const handleStop = () => {
    if (!isGenerating) return;
    setActiveButton('stop');
    onStopGenerating();
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="flex group">
        <CyberRadioButton
          id="cyber-capture"
          name="cyber-controls"
          label="Capture"
          number="r1"
          checked={activeButton === 'capture'}
          onChange={handleCapture}
          disabled={hasScreenshot}
          icon={Camera}
          glitchText="_Capture_"
        />
        <CyberRadioButton
          id="cyber-start"
          name="cyber-controls"
          label="Start"
          number="r2"
          checked={activeButton === 'start' || isGenerating}
          onChange={handleStart}
          disabled={!hasScreenshot || isGenerating}
          icon={Play}
          glitchText="_Start_"
        />
        <CyberRadioButton
          id="cyber-stop"
          name="cyber-controls"
          label="Stop"
          number="r3"
          checked={activeButton === 'stop'}
          onChange={handleStop}
          disabled={!isGenerating}
          icon={Square}
          glitchText="_Stop_"
        />
      </div>

      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <div>
            <CyberExpandButton
              icon={Settings}
              text="Menu"
              onClick={() => setMenuOpen(!menuOpen)}
              backgroundColor="hsl(var(--accent))"
              ariaLabel="Open menu"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" align="end">
          <SettingsMenu
            onExportTxt={handleExportTxt}
            onExportJson={handleExportTxt}
            onClearChat={handleClearChat}
            onToggleSettings={handleToggleSettings}
          />
        </PopoverContent>
      </Popover>

      <CyberExpandButton
        icon={ExternalLink}
        text="Popout"
        onClick={onOpenPopout}
        disabled={isPopoutOpen}
        backgroundColor="hsl(var(--primary))"
        ariaLabel={isPopoutOpen ? "Popout window already open" : "Open popout window"}
      />

      <CyberExpandButton
        icon={Swords}
        text="Spawn Boss"
        onClick={() => useRaidBossStore.getState().startRaid('Dragon', 1000)}
        backgroundColor="#ef4444"
        ariaLabel="Spawn Raid Boss"
      />
    </div>
  );
};
