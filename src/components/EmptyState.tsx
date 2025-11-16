import { ReactNode } from "react";
import { MessageSquare, Camera, Play, Info } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="mb-4 text-accent/40 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.05)]">{icon}</div>
      <h3 className="text-base font-bold text-foreground mb-2 uppercase tracking-wide">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export const NoChatEmptyState = () => (
  <EmptyState
    icon={<MessageSquare className="w-16 h-16" />}
    title="No messages yet"
    description="Capture your screen and start generating AI chat messages to see them appear here."
  />
);

export const NoScreenshotEmptyState = ({ onCapture }: { onCapture?: () => void }) => (
  <EmptyState
    icon={<Camera className="w-16 h-16" />}
    title="No screen captured"
    description="Click the 'Capture Screen' button to select a window or screen to analyze."
    action={
      onCapture && (
        <button
          onClick={onCapture}
          className="text-sm text-primary hover:underline"
          aria-label="Capture screen"
        >
          Capture Screen
        </button>
      )
    }
  />
);

export const NotGeneratingEmptyState = ({ onStart }: { onStart?: () => void }) => (
  <EmptyState
    icon={<Play className="w-16 h-16" />}
    title="Generation stopped"
    description="Click 'Start' to begin generating AI chat messages based on your screen content."
    action={
      onStart && (
        <button
          onClick={onStart}
          className="text-sm text-primary hover:underline"
          aria-label="Start generating"
        >
          Start Generating
        </button>
      )
    }
  />
);

export const InfoEmptyState = ({ message }: { message: string }) => (
  <EmptyState icon={<Info className="w-16 h-16" />} title="Information" description={message} />
);
