import { useHypeStore } from "@/lib/hypeManager";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HypeMeter() {
    const { level, percent, combo, isActive } = useHypeStore();

    return (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Hype Train
                </CardTitle>
                {isActive && (
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold animate-pulse">
                        ACTIVE
                    </span>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                        <p className="text-3xl font-black italic text-emerald-400">
                            LVL {level}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Combo</p>
                        <p className="text-2xl font-bold text-white">{combo}x</p>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to Level {Math.min(level + 1, 5)}</span>
                        <span>{Math.round(percent)}%</span>
                    </div>
                    <Progress value={percent} className="h-3 bg-emerald-950" />
                </div>
            </CardContent>
        </Card>
    );
}
