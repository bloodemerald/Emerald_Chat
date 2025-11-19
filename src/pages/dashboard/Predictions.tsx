import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePredictionStore } from "@/lib/predictions";
import { Trophy, Clock, Lock, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Predictions() {
    const { activePrediction, history, createPrediction, resolvePrediction, cancelPrediction } = usePredictionStore();
    const [title, setTitle] = useState("");
    const [option1, setOption1] = useState("Yes");
    const [option2, setOption2] = useState("No");
    const [duration, setDuration] = useState("60");

    const handleCreate = () => {
        if (!title) return;
        createPrediction(title, [option1, option2], parseInt(duration));
        setTitle("");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Predictions</h2>
                    <p className="text-muted-foreground">
                        Engage your viewers with real-time betting markets.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Create / Active Prediction */}
                    <Card className="border-emerald-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                {activePrediction ? "Active Prediction" : "Create Prediction"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activePrediction ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">{activePrediction.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {activePrediction.status === 'active' ? (
                                                <span className="flex items-center gap-1 text-emerald-400">
                                                    <Clock className="w-4 h-4" /> Open
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <Lock className="w-4 h-4" /> Locked
                                                </span>
                                            )}
                                            <span>•</span>
                                            <span>Ends in {Math.max(0, Math.ceil((activePrediction.endsAt - Date.now()) / 1000))}s</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {activePrediction.options.map((opt) => {
                                            const totalPoints = activePrediction.options.reduce((acc, o) => acc + o.totalPoints, 0);
                                            const percent = totalPoints > 0 ? (opt.totalPoints / totalPoints) * 100 : 0;

                                            return (
                                                <div key={opt.id} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{opt.label}</span>
                                                        <span className="text-muted-foreground">{Math.round(percent)}% ({opt.totalPoints} pts)</span>
                                                    </div>
                                                    <Progress value={percent} className="h-2" />
                                                    {activePrediction.status !== 'resolved' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full mt-2"
                                                            onClick={() => resolvePrediction(opt.id)}
                                                        >
                                                            Declare Winner
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Button variant="destructive" onClick={cancelPrediction} className="w-full">
                                        Cancel Prediction
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            placeholder="Will I win this game?"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Option 1</label>
                                            <Input
                                                value={option1}
                                                onChange={(e) => setOption1(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Option 2</label>
                                            <Input
                                                value={option2}
                                                onChange={(e) => setOption2(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Duration (seconds)</label>
                                        <Input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                        Start Prediction
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">No past predictions</p>
                                )}
                                {history.map((pred) => (
                                    <div key={pred.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{pred.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Winner: {pred.options.find(o => o.id === pred.winningOptionId)?.label}
                                            </p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
