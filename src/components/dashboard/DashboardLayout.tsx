import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Layers,
    Zap,
    Gamepad2,
    Trophy,
    Settings,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
        { icon: Layers, label: "Overlay", path: "/dashboard/overlay" },
        { icon: Zap, label: "Hype Train", path: "/dashboard/hype" },
        { icon: Gamepad2, label: "Mini-Games", path: "/dashboard/games" },
        { icon: Trophy, label: "Predictions", path: "/dashboard/predictions" },
        { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out transform",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Emerald Control
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3",
                                        isActive && "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "ml-64" : "ml-0"
                )}
            >
                <header className="h-16 border-b bg-card/50 backdrop-blur px-4 flex items-center gap-4 sticky top-0 z-40">
                    {!isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="flex-1" />
                    <Button variant="outline" asChild>
                        <Link to="/">Back to Chat</Link>
                    </Button>
                </header>

                <div className="p-6 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
