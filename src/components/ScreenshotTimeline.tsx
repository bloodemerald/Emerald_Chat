import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Eye, TrendingUp, Activity } from "lucide-react";
import { ScreenshotHistory, ScreenshotFrame } from "@/lib/screenshotHistory";

interface ScreenshotTimelineProps {
  history: ScreenshotHistory;
  onClose: () => void;
}

export const ScreenshotTimeline = ({ history, onClose }: ScreenshotTimelineProps) => {
  const [selectedFrame, setSelectedFrame] = useState<ScreenshotFrame | null>(null);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getChangeColor = (score?: number) => {
    if (!score) return "text-gray-400";
    if (score < 10) return "text-green-400";
    if (score < 30) return "text-yellow-400";
    if (score < 60) return "text-orange-400";
    return "text-red-400";
  };

  const getChangeLabel = (score?: number) => {
    if (!score) return "No data";
    if (score < 10) return "Minor";
    if (score < 30) return "Moderate";
    if (score < 60) return "Significant";
    return "Major";
  };

  // Reverse to show most recent first
  const frames = [...history.frames].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-b from-gray-900 to-black border border-purple-500/30 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/30 bg-black/50">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Screenshot Timeline</h2>
            <span className="px-2 py-1 text-xs font-semibold text-purple-300 bg-purple-500/20 rounded">
              {frames.length} frames
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(100%-5rem)]">
          {/* Timeline Sidebar */}
          <div className="w-80 border-r border-purple-500/30 overflow-y-auto bg-black/30">
            <div className="p-4 space-y-2">
              {frames.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No screenshots captured yet</p>
                  <p className="text-sm mt-1">Start streaming to track changes</p>
                </div>
              ) : (
                frames.map((frame, index) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedFrame?.id === frame.id
                        ? "bg-purple-500/30 border border-purple-500"
                        : "bg-white/5 border border-transparent hover:bg-white/10 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-12 rounded overflow-hidden bg-black border border-purple-500/20">
                        <img
                          src={frame.image}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-purple-300">
                            {formatTimeAgo(frame.timestamp)}
                          </span>
                          {frame.changeScore !== undefined && (
                            <span className={`text-xs font-bold ${getChangeColor(frame.changeScore)}`}>
                              {frame.changeScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {formatTimestamp(frame.timestamp)}
                        </p>
                        {frame.changeDescription && (
                          <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                            {frame.changeDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 overflow-auto bg-black/20">
            {selectedFrame ? (
              <div className="p-6 space-y-6">
                {/* Screenshot Preview */}
                <div className="relative rounded-lg overflow-hidden border border-purple-500/30 shadow-xl">
                  <img
                    src={selectedFrame.image}
                    alt="Screenshot preview"
                    className="w-full h-auto"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {/* Timestamp */}
                  <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-semibold text-white">Timestamp</h3>
                    </div>
                    <p className="text-gray-300">
                      {new Date(selectedFrame.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatTimeAgo(selectedFrame.timestamp)}</p>
                  </div>

                  {/* Change Detection */}
                  {selectedFrame.changeScore !== undefined && (
                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-white">Change Detection</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-400">Visual Difference</span>
                            <span className={`text-sm font-bold ${getChangeColor(selectedFrame.changeScore)}`}>
                              {selectedFrame.changeScore}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                selectedFrame.changeScore < 10
                                  ? "bg-green-500"
                                  : selectedFrame.changeScore < 30
                                  ? "bg-yellow-500"
                                  : selectedFrame.changeScore < 60
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${selectedFrame.changeScore}%` }}
                            />
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded ${getChangeColor(selectedFrame.changeScore)} bg-white/10`}>
                          {getChangeLabel(selectedFrame.changeScore)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Change Description */}
                  {selectedFrame.changeDescription && (
                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-white">What Changed</h3>
                      </div>
                      <p className="text-gray-300">{selectedFrame.changeDescription}</p>
                    </div>
                  )}

                  {/* Detected Content */}
                  {selectedFrame.detectedContent && (
                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-semibold text-white">Detected Content</h3>
                      </div>
                      <p className="text-gray-300">{selectedFrame.detectedContent}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a frame to view details</p>
                  <p className="text-sm mt-2">Click on any screenshot in the timeline</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
