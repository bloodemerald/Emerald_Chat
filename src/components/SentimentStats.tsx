import { useMemo } from "react";
import { Message } from "@/types/personality";

interface SentimentStatsProps {
  messages: Message[];
  className?: string;
}

export const SentimentStats = ({ messages, className = "" }: SentimentStatsProps) => {
  const stats = useMemo(() => {
    const withSentiment = messages.filter(msg => msg.sentiment);

    if (withSentiment.length === 0) {
      return {
        total: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        positivePercent: 0,
        negativePercent: 0,
        neutralPercent: 0,
        averageScore: 0,
      };
    }

    const positive = withSentiment.filter(msg => msg.sentiment?.label === 'positive').length;
    const negative = withSentiment.filter(msg => msg.sentiment?.label === 'negative').length;
    const neutral = withSentiment.filter(msg => msg.sentiment?.label === 'neutral').length;
    const total = withSentiment.length;

    const averageScore = withSentiment.reduce((sum, msg) => sum + (msg.sentiment?.score || 0), 0) / total;

    return {
      total,
      positive,
      negative,
      neutral,
      positivePercent: (positive / total) * 100,
      negativePercent: (negative / total) * 100,
      neutralPercent: (neutral / total) * 100,
      averageScore,
    };
  }, [messages]);

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">📊</span>
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
          Sentiment Analytics
        </h3>
      </div>

      <div className="space-y-2">
        {/* Sentiment Distribution */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.positivePercent}%` }}
            title={`Positive: ${stats.positive} (${stats.positivePercent.toFixed(1)}%)`}
          />
          <div
            className="bg-gray-400 transition-all duration-500"
            style={{ width: `${stats.neutralPercent}%` }}
            title={`Neutral: ${stats.neutral} (${stats.neutralPercent.toFixed(1)}%)`}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${stats.negativePercent}%` }}
            title={`Negative: ${stats.negative} (${stats.negativePercent.toFixed(1)}%)`}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-emerald-50 rounded p-1.5 border border-emerald-200">
            <div className="text-xs font-bold text-emerald-600">{stats.positive}</div>
            <div className="text-[9px] text-emerald-700 font-medium">Positive</div>
          </div>
          <div className="bg-gray-50 rounded p-1.5 border border-gray-200">
            <div className="text-xs font-bold text-gray-600">{stats.neutral}</div>
            <div className="text-[9px] text-gray-700 font-medium">Neutral</div>
          </div>
          <div className="bg-red-50 rounded p-1.5 border border-red-200">
            <div className="text-xs font-bold text-red-600">{stats.negative}</div>
            <div className="text-[9px] text-red-700 font-medium">Negative</div>
          </div>
        </div>

        {/* Average Sentiment Score */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-gray-100">
          <span>Overall Sentiment:</span>
          <span className={`font-bold ${
            stats.averageScore > 0.15 ? 'text-emerald-600' :
            stats.averageScore < -0.15 ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {stats.averageScore > 0.15 ? '😊 Positive' :
             stats.averageScore < -0.15 ? '😟 Negative' :
             '😐 Neutral'}
          </span>
        </div>
      </div>
    </div>
  );
};
