import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlackjackGame, Card as CardType } from "@/lib/games/blackjack";
import { motion } from "framer-motion";

export default function Games() {
    const [game] = useState(() => new BlackjackGame());
    const [gameState, setGameState] = useState(game.state);
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [message, setMessage] = useState("");

    const updateUI = () => {
        setGameState(game.state);
        setPlayerHand([...game.playerHand]);
        setDealerHand([...game.dealerHand]);

        if (game.state === 'won') setMessage("You Won! 🎉");
        else if (game.state === 'lost') setMessage("You Lost 💀");
        else if (game.state === 'push') setMessage("Push 🤝");
        else setMessage("");
    };

    const handleDeal = () => {
        game.deal();
        updateUI();
    };

    const handleHit = () => {
        game.hit();
        updateUI();
    };

    const handleStand = () => {
        game.stand();
        updateUI();
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mini-Games</h2>
                    <p className="text-muted-foreground">
                        Play games to earn points or test the logic.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Blackjack Table */}
                    <Card className="bg-emerald-950/30 border-emerald-500/20">
                        <CardHeader>
                            <CardTitle>Blackjack</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[300px] flex flex-col justify-between">
                                {/* Dealer Area */}
                                <div className="flex justify-center gap-2 mb-8">
                                    {dealerHand.map((card, i) => (
                                        <PlayingCard key={i} card={card} hidden={gameState === 'playing' && i === 1} />
                                    ))}
                                    {dealerHand.length === 0 && <div className="text-muted-foreground">Dealer's Hand</div>}
                                </div>

                                {/* Message Area */}
                                <div className="text-center h-8 font-bold text-xl text-emerald-400">
                                    {message}
                                </div>

                                {/* Player Area */}
                                <div className="flex justify-center gap-2 mt-8">
                                    {playerHand.map((card, i) => (
                                        <PlayingCard key={i} card={card} />
                                    ))}
                                    {playerHand.length === 0 && <div className="text-muted-foreground">Your Hand</div>}
                                </div>

                                {/* Controls */}
                                <div className="flex justify-center gap-4 mt-8">
                                    {gameState === 'idle' || gameState === 'won' || gameState === 'lost' || gameState === 'push' ? (
                                        <Button onClick={handleDeal} className="w-full max-w-xs">Deal Hand</Button>
                                    ) : (
                                        <>
                                            <Button onClick={handleHit} variant="secondary">Hit</Button>
                                            <Button onClick={handleStand} variant="default">Stand</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Slots Placeholder */}
                    <Card className="opacity-50">
                        <CardHeader>
                            <CardTitle>Slots (Coming Soon)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-[300px]">
                            <p>Locked</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function PlayingCard({ card, hidden }: { card: CardType; hidden?: boolean }) {
    if (hidden) {
        return (
            <div className="w-16 h-24 bg-emerald-800 rounded-md border-2 border-emerald-600 flex items-center justify-center shadow-lg">
                <div className="w-12 h-20 bg-emerald-900/50 rounded-sm" />
            </div>
        );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-16 h-24 bg-white rounded-md flex flex-col items-center justify-center shadow-lg relative"
        >
            <span className={`text-xl font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>
                {card.rank}
            </span>
            <span className={`text-2xl ${isRed ? 'text-red-500' : 'text-black'}`}>
                {card.suit}
            </span>
        </motion.div>
    );
}
