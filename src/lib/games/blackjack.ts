export type Card = {
    suit: '♠' | '♥' | '♦' | '♣';
    rank: string;
    value: number;
};

export type GameState = 'idle' | 'playing' | 'won' | 'lost' | 'push';

export class BlackjackGame {
    deck: Card[] = [];
    playerHand: Card[] = [];
    dealerHand: Card[] = [];
    state: GameState = 'idle';

    constructor() {
        this.reset();
    }

    reset() {
        this.deck = this.createDeck();
        this.playerHand = [];
        this.dealerHand = [];
        this.state = 'idle';
    }

    createDeck(): Card[] {
        const suits = ['♠', '♥', '♦', '♣'] as const;
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                let value = parseInt(rank);
                if (isNaN(value)) {
                    value = rank === 'A' ? 11 : 10;
                }
                deck.push({ suit, rank, value });
            }
        }

        return this.shuffle(deck);
    }

    shuffle(deck: Card[]): Card[] {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    deal(): void {
        this.reset();
        this.state = 'playing';
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());
        this.playerHand.push(this.drawCard());
        this.dealerHand.push(this.drawCard());

        if (this.calculateScore(this.playerHand) === 21) {
            this.state = 'won'; // Blackjack!
        }
    }

    hit(): void {
        if (this.state !== 'playing') return;

        this.playerHand.push(this.drawCard());
        const score = this.calculateScore(this.playerHand);

        if (score > 21) {
            this.state = 'lost';
        }
    }

    stand(): void {
        if (this.state !== 'playing') return;

        // Dealer logic
        while (this.calculateScore(this.dealerHand) < 17) {
            this.dealerHand.push(this.drawCard());
        }

        const playerScore = this.calculateScore(this.playerHand);
        const dealerScore = this.calculateScore(this.dealerHand);

        if (dealerScore > 21 || playerScore > dealerScore) {
            this.state = 'won';
        } else if (dealerScore > playerScore) {
            this.state = 'lost';
        } else {
            this.state = 'push';
        }
    }

    drawCard(): Card {
        return this.deck.pop()!;
    }

    calculateScore(hand: Card[]): number {
        let score = 0;
        let aces = 0;

        for (const card of hand) {
            score += card.value;
            if (card.rank === 'A') aces += 1;
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }
}
