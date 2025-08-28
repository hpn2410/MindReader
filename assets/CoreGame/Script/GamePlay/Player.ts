
import { SpriteFrame } from 'cc';
import { Card } from './Card';
export class Player{
    id: number;
    playerName: string;
    hand: Card[];
    currentHealth: number;
    maxHealth: number;
    avatar: SpriteFrame;

    public selectedCard: Card | null = null;

    constructor(id: number, playerName: string, maxHealth: number, avatar: SpriteFrame) {
        this.id = id;
        this.playerName = playerName;
        this.currentHealth = maxHealth;
        this.maxHealth = maxHealth;
        this.avatar = avatar;
    }

    public receiveCards(cards: Card[]) {
        this.hand = cards;
    }

    takeDamage(amount: number) {
        this.currentHealth = Math.max(this.currentHealth - amount, 0);
    }

    isAlive() {
        return this.currentHealth > 0;
    }
}


