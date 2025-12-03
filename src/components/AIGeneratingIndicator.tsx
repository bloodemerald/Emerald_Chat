import { Loader2 } from "lucide-react";

interface AIGeneratingIndicatorProps {
  isVisible: boolean;
}

export const AIGeneratingIndicator = ({ isVisible }: AIGeneratingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center justify-center py-4 px-6">
      <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
        <span className="text-sm font-medium text-emerald-600">
          AI is thinking...
        </span>
      </div>
    </div>
  );
};
