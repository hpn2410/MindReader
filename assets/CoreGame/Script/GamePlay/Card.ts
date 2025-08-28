
export enum CardSuit {
    Hearts = "Hearts",
    Diamonds = "Diamonds",
    Spades = "Spades",
    Clubs = "Clubs"
}

export class Card {
    value: number = 2;
    suit: CardSuit = CardSuit.Hearts;
    spriteFramePath: string;
    constructor(value: number, suit: CardSuit, spriteFramePath: string) {
        this.value = value;
        this.suit = suit;
        this.spriteFramePath = spriteFramePath;
    }

    public getDisPlayCardName(): string {
        let valueStr;
        switch (this.value) {
            case (2): valueStr = '2';
                break;
            case (3): valueStr = '3';
                break;
            case (4): valueStr = '4';
                break;
            case (5): valueStr = '5';
                break;
            case (6): valueStr = '6';
                break;
            case (7): valueStr = '7';
                break;
            case (8): valueStr = '8';
                break;
            case (9): valueStr = '9';
                break;
            case (10): valueStr = '10';
                break;
            case (11): valueStr = '11';
                break;
            case (12): valueStr = '12';
                break;
            case (13): valueStr = '13';
                break;
            case (14): valueStr = '14';
                break;
        }
        return `${valueStr}_${this.suit}`;
    }
}


