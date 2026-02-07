import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ArrowUpRight,
  Bot,
  CircleCheck,
  Clock3,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

const kpiCards = [
  {
    title: "Concurrent Viewers",
    value: "1,842",
    trend: "+11% vs last stream",
    icon: Users,
  },
  {
    title: "Messages / min",
    value: "97",
    trend: "Peak: 154 during boss fight",
    icon: MessageSquare,
  },
  {
    title: "AI Assist Responses",
    value: "312",
    trend: "92% helpful feedback",
    icon: Bot,
  },
  {
    title: "Hype Momentum",
    value: "Level 4",
    trend: "73% to Level 5",
    icon: Zap,
  },
];

const workflowChecks = [
  { label: "Overlay sync", status: "Healthy", ready: true },
  { label: "Moderation pipeline", status: "2 flags pending", ready: false },
  { label: "Prediction engine", status: "Ready for launch", ready: true },
  { label: "Event webhooks", status: "Connected", ready: true },
];

const activityFeed = [
  { title: "Hype Train triggered", meta: "2m ago • 218 participants", tone: "text-emerald-400" },
  { title: "AI auto-recap posted", meta: "6m ago • 98% positive rating", tone: "text-cyan-400" },
  { title: "Prediction resolved: Boss attempt", meta: "11m ago • 64k channel points", tone: "text-violet-400" },
  { title: "New mod added to safety queue", meta: "18m ago • @lunarbyte", tone: "text-amber-400" },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                Live Operations
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Stream Command Center</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                You now have a unified view of engagement, AI quality, moderation health, and monetization momentum.
                This view is designed to feel like a production control room, not a prototype.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="gap-2">
                Launch Overlay
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Optimize Settings
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-tight">{kpi.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{kpi.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                Session goals and execution
              </CardTitle>
              <CardDescription>Track milestones that make each stream feel intentional and premium.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Engagement goal</span>
                  <span className="text-muted-foreground">73% complete</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Subscriber conversion goal</span>
                  <span className="text-muted-foreground">48% complete</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {workflowChecks.map((item) => (
                  <div key={item.label} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{item.label}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      {item.ready ? (
                        <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Live activity feed
              </CardTitle>
              <CardDescription>Important moments from this broadcast.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityFeed.map((event, index) => (
                <div key={event.title}>
                  <p className={`text-sm font-medium ${event.tone}`}>{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.meta}</p>
                  {index < activityFeed.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                AI performance snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Response latency: 1.3s median (target &lt; 2.0s)</p>
              <p>• Toxicity false positives: 1.8% (improved this week)</p>
              <p>• Context relevance score: 8.9 / 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Next best actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="rounded-md border border-border/70 p-3">Promote a timed poll now to convert hype momentum into channel point usage.</p>
              <p className="rounded-md border border-border/70 p-3">Enable auto-highlight clips for moments above 120 msgs/min.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
