import { _decorator, Component, director, instantiate, Label, Node, Prefab, resources, RichText, Sprite, SpriteFrame } from 'cc';
import { Card, CardSuit } from './Card';
import { Player } from './Player';
import { GameState } from './GameState';
import { DragAndDropCard } from './DragAndDropCard';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('GamePlayManager')
export class GamePlayManager extends Component {

    //
    @property(Node) playerCardHolder: Node;
    @property(Prefab) cardHolder: Prefab;
    @property(Node) dropZone: Node | null = null;
    @property(Label) turnLabel: Label;
    @property(Label) timeLabel: Label;

    // Win game UI
    @property(Node) winGameUI: Node;
    @property(Node) botSpriteNodes: Node[] = [];
    @property(SpriteFrame) avatarPlayer: SpriteFrame[] = [];
    @property(RichText) winRichText_1: RichText;
    @property(Label) winLabel_1: Label;
    @property(Label) winLabel_2: Label;
    @property(Sprite) avatarWinner: Sprite;

    //Sudden Death UI
    @property(Node) SuddenDeathUI: Node;

    // Player health
    @property([Node]) playerHeartContainers: Node[] = [];
    @property(SpriteFrame) heartRed: SpriteFrame = null;
    @property(SpriteFrame) heartGray: SpriteFrame = null;

    // Take Damage UI
    @property(Node) takeDamageUI: Node;
    @property(Sprite) takeDamageAvatar: Sprite;
    @property(Node) takeDamageHeartContainers: Node;


    deck: Card[] = [];
    players: Player[] = [];
    state: GameState = GameState.GamePlayMenu;

    turnTime: number = 30; // time every turn
    timer: number = 0;
    playerHasPlayed: boolean = false;
    turnCount: number = 1;

    @property({
        tooltip: "Chọn turn để chia lại bài"
    })
    reDealCardTurn: number = 14;

    startGameAgainTimer: number = 5;
    isEndGame: boolean;
    currentTurnCards: { playerId: number, card: Card }[] = [];

    // Sudden Death Event
    suddentDeadthTimer: number = 10;
    @property({
        tooltip: "Chọn turn triển khai sự kiện suddenDeath"
    })
    suddentDeadthTurn: number = 20;
    suddentDeathEvent: boolean = false;
    suddenDeathShown: boolean = false;

    start() {
        this.initPlayers();
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();

        this.showPlayerCards();
        this.startTurn();
    }

    update(dt: number) {

        if (this.startGameAgainTimer > 0 && this.isEndGame) {
            this.startGameAgainTimer -= dt
            const timeRemaining = Math.max(0, Math.floor(this.startGameAgainTimer));
            this.winLabel_2.string = `START ANOTHER GAME IN ${timeRemaining}s`
        }
        else if (this.startGameAgainTimer <= 0) {
            director.loadScene('GamePlay');
        }

        if (this.state === GameState.GamePlayMenu) return;
        if (this.playerHasPlayed) return;

        if (this.timer > 0) {
            this.timer -= dt;

            const timerRemaining = Math.max(0, Math.floor(this.timer));
            this.timeLabel.string = `${timerRemaining} SECONDS REMAINING`;

            if (this.timer <= 0) {
                // Run out of time and play hasn't played
                if (!this.playerHasPlayed) {
                    this.autoPlayCard();
                }
            }
        }
    }

    startTurn() {
        console.log("Start new turn!");
        console.log(`${this.players[0].playerName}: ${this.players[0].currentHealth}`);
        console.log(`${this.players[1].playerName}: ${this.players[1].currentHealth}`);
        console.log(`${this.players[2].playerName}: ${this.players[2].currentHealth}`);
        console.log(`${this.players[3].playerName}: ${this.players[3].currentHealth}`);

        this.enablePlayerDrag();

        if (this.turnCount >= this.suddentDeadthTurn) {
            this.suddentDeathEvent = true;
            this.turnTime = this.suddentDeadthTimer; // timer 10s
            console.log("SPECIAL EVENT ACTIVATED: Timer 10s, Damage x4!");

            if (!this.suddenDeathShown) {
                this.suddenDeathShown = true;
                this.suddenDeathEvent();
                return;
            }

        } else {
            this.turnTime = 30;
        }

        this.startTurnTimer();
    }

    endTurn() {
        console.log("End Turn!");
        this.turnCount++;

        if (this.turnCount === this.reDealCardTurn) {
            console.log("Hết bài → Chia lại cho tất cả người chơi");
            this.reshuffleDeckForAllPlayers();
        }
        
        this.startTurn(); // Start new turn
    }

    playerPlayedCard(spriteFrame: SpriteFrame, card: Card) {
        const player = this.players.find(p => p.id === 1);
        if (!player || !player.isAlive()) return; // Player death

        if (this.playerHasPlayed) return;
        this.playerHasPlayed = true;
        this.disablePlayerDrag();

        if (this.dropZone) {
            const dropSprite = this.dropZone.getComponent(Sprite);
            if (dropSprite) dropSprite.spriteFrame = spriteFrame;

            // Delete card from player.hand
            const cardIndex = player.hand.indexOf(card);
            if (cardIndex > -1) {
                player.hand.splice(cardIndex, 1);
            }
            this.currentTurnCards.push({ playerId: 1, card: card });

            this.simulateBotsTurn();
        }
    }

    autoPlayCard() {
        const player = this.players.find(p => p.id === 1);
        if (!player || !player.isAlive()) {
            console.log("Player death => skip turn");
            this.playerHasPlayed = true;
            this.simulateBotsTurn();
            return;
        }

        console.log("Auto play when run out of time!");

        const cards = this.playerCardHolder.children;
        if (cards.length === 0) return;

        const randomIndex = Math.floor(Math.random() * cards.length);
        const randomCard = cards[randomIndex];
        const cardSprite = randomCard.getComponent(Sprite);

        const cardData = player.hand[randomIndex];
        player.hand.splice(randomIndex, 1);

        if (cardSprite && this.dropZone) {
            const dropSprite = this.dropZone.getComponent(Sprite);
            if (dropSprite) dropSprite.spriteFrame = cardSprite.spriteFrame;
        }

        this.currentTurnCards.push({ playerId: 1, card: cardData });

        randomCard.destroy();
        this.playerHasPlayed = true;

        this.simulateBotsTurn();
    }

    simulateBotsTurn() {
        this.scheduleOnce(() => {
            resources.load("botCard/CardBehindCorrect/spriteFrame", SpriteFrame, (err, sfCorrect) => {
                if (err) return;

                this.botSpriteNodes.forEach((botNode, index) => {
                    const botPlayer = this.players[index + 1]; // bot index -> player id
                    if (!botPlayer || !botPlayer.isAlive()) {
                        // Bot death => load resources CardBehind
                        resources.load("botCard/CardBehind/spriteFrame", SpriteFrame, (err, sfDead) => {
                            if (!err) {
                                const botSprite = botNode.getComponent(Sprite);
                                if (botSprite) botSprite.spriteFrame = sfDead;
                            }
                        });
                        return; // Skip bot death
                    }

                    // Bot alive => simulate
                    const botSprite = botNode.getComponent(Sprite);
                    if (botSprite) botSprite.spriteFrame = sfCorrect;

                    if (botPlayer.hand.length > 0) {
                        const randomIndex = Math.floor(Math.random() * botPlayer.hand.length);
                        const botCard = botPlayer.hand[randomIndex];
                        botPlayer.hand.splice(randomIndex, 1);

                        this.currentTurnCards.push({ playerId: botPlayer.id, card: botCard });
                    }
                });
            });

            // Delay 1s => end turn
            this.scheduleOnce(() => {
                this.calculateTurnResult();
            }, 1);

        }, 1);
    }


    calculateTurnResult() {
        const suitOrder: Record<CardSuit, number> = {
            [CardSuit.Spades]: 0,
            [CardSuit.Clubs]: 1,
            [CardSuit.Diamonds]: 2,
            [CardSuit.Hearts]: 3
        };

        // return players alive
        const aliveTurnCards = this.currentTurnCards.filter(tc => {
            const player = this.players.find(p => p.id === tc.playerId);
            return player && player.isAlive();
        });

        if (aliveTurnCards.length === 0) {
            console.log("Không còn ai sống để so bài.");
            return;
        }

        // Find lowest card
        let lowestCard = aliveTurnCards[0];
        for (let i = 1; i < aliveTurnCards.length; i++) {
            const current = aliveTurnCards[i];
            if (
                current.card.value < lowestCard.card.value ||
                (current.card.value === lowestCard.card.value &&
                    suitOrder[current.card.suit] < suitOrder[lowestCard.card.suit])
            ) {
                lowestCard = current;
            }
        }

        // Show card if player alive
        this.currentTurnCards.forEach(turnCard => {
            const botPlayer = this.players.find(p => p.id === turnCard.playerId);
            if (!botPlayer || !botPlayer.isAlive() || turnCard.playerId === 1) return;

            const botIndex = turnCard.playerId - 2;
            const botNode = this.botSpriteNodes[botIndex];
            if (botNode) {
                const spritePath = `cards/${turnCard.card.value}_${turnCard.card.suit}/spriteFrame`;
                resources.load(spritePath, SpriteFrame, (err, sf) => {
                    if (!err) {
                        const botSprite = botNode.getComponent(Sprite);
                        if (botSprite) botSprite.spriteFrame = sf;
                    }
                });
            }
        });

        this.scheduleOnce(() => {
            const loser = this.players.find(p => p.id === lowestCard.playerId);

            const afterDamage = () => {
                const alivePlayers = this.players.filter(p => p.isAlive());
                if (alivePlayers.length === 1) {
                    console.log(`Game Over! Winner is: ${alivePlayers[0].playerName}`);
                    this.state = GameState.GamePlayMenu;
                    this.endGame(alivePlayers[0].playerName, alivePlayers[0].avatar);
                    return;
                }
                this.currentTurnCards = [];
                this.endTurn();
            };

            if (loser) {
                const damage = this.suddentDeathEvent ? 4 : 1;
                loser.takeDamage(damage);
                this.updatePlayerHealthUI(loser.id);
                this.takeDamageUIResult(loser.avatar, loser.currentHealth, afterDamage);
            } else {
                afterDamage();
            }

        }, 3);
    }

    takeDamageUIResult(avatar: SpriteFrame, currentHealth: number, onFinish?: () => void) {

        SoundSystem.instance.onPlayBeingHitSound();
        this.disablePlayerDrag();

        this.takeDamageUI.active = true;
        this.takeDamageAvatar.spriteFrame = avatar;
        const heartsResult = this.takeDamageHeartContainers.children;

        for (let i = 0; i < heartsResult.length; i++) {

            const heartSprite = heartsResult[i].getComponent(Sprite);

            if (heartSprite) {
                if (i < currentHealth) {
                    heartSprite.spriteFrame = this.heartRed;
                } else {
                    heartSprite.spriteFrame = this.heartGray;
                }
            }
        }

        const prevTimer = this.timer;
        this.timer = 0;
        this.scheduleOnce(() => {
            this.takeDamageUI.active = false;
            this.timer = prevTimer;
            const player = this.players.find(p => p.id === 1);
            if (player && player.isAlive()) {
                this.enablePlayerDrag();
            }

            if (onFinish) onFinish();

        }, 3);
    }

    initPlayers() {
        this.players.push(new Player(1, 'Pnu', 4, this.avatarPlayer[0]));
        this.players.push(new Player(2, 'Bot2', 4, this.avatarPlayer[1]));
        this.players.push(new Player(3, 'Bot3', 4, this.avatarPlayer[2]));
        this.players.push(new Player(4, 'Bot4', 4, this.avatarPlayer[3]));

        this.players.forEach(p => {
            this.updatePlayerHealthUI(p.id);
        });
    }

    createDeck() {
        this.deck = [];
        for (let value = 2; value <= 14; value++) {
            for (let suit of [CardSuit.Hearts, CardSuit.Spades, CardSuit.Diamonds, CardSuit.Clubs]) {
                this.deck.push(new Card(value, suit, `cards/${value}_${suit}/spriteFrame`));
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        for (let i = 0; i < this.players.length; i++) {
            let cards = this.deck.slice(i * 13, (i + 1) * 13);
            this.players[i].receiveCards(cards);
        }
    }

    reshuffleDeckForAllPlayers() {
        // reset card[]
        this.players.forEach(player => {
            player.hand = [];
        });

        // Create new deck and deal card again
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();

        // Remove player card's UI
        this.playerCardHolder.removeAllChildren();
        this.showPlayerCards();
    }

    showPlayerCards() {
        const player = this.players.find(p => p.id === 1); // Pnu
        if (!player) return;

        player.hand.forEach(card => {
            resources.load(card.spriteFramePath, SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error("Load error:", err);
                } else {
                    console.log("Load success:", spriteFrame);
                }

                const cardNode = instantiate(this.cardHolder);

                const cardSprite = cardNode.getComponent(Sprite);
                cardSprite.spriteFrame = spriteFrame;
                cardNode.setParent(this.playerCardHolder);

                const dragDropComp = cardNode.getComponent(DragAndDropCard);
                if (dragDropComp) {
                    dragDropComp.dropZone = this.dropZone;
                    dragDropComp.gamePlayManager = this;
                    dragDropComp.cardData = card;
                }
            })
        })
    }

    disablePlayerDrag() {
        this.playerCardHolder.children.forEach(cardNode => {
            const dragDropComp = cardNode.getComponent(DragAndDropCard);
            if (dragDropComp) {
                cardNode.off(Node.EventType.TOUCH_START);
                cardNode.off(Node.EventType.TOUCH_MOVE);
                cardNode.off(Node.EventType.TOUCH_END);
                cardNode.off(Node.EventType.TOUCH_CANCEL);
            }
        });
    }

    enablePlayerDrag() {
        this.playerCardHolder.children.forEach(cardNode => {
            const dragDropComp = cardNode.getComponent(DragAndDropCard);
            if (dragDropComp) {
                cardNode.on(Node.EventType.TOUCH_START, dragDropComp.onTouchStart, dragDropComp);
                cardNode.on(Node.EventType.TOUCH_MOVE, dragDropComp.onTouchMove, dragDropComp);
                cardNode.on(Node.EventType.TOUCH_END, dragDropComp.onTouchEnd, dragDropComp);
                cardNode.on(Node.EventType.TOUCH_CANCEL, dragDropComp.onTouchEnd, dragDropComp);
            }
        });
    }

    endGame(playerName: string, avatarPlayer: SpriteFrame) {
        this.disablePlayerDrag();
        this.winGameUI.active = true;
        this.avatarWinner.spriteFrame = avatarPlayer;
        this.winLabel_1.string = `${playerName} IS WINNER`
        this.winRichText_1.string = `<color = green>${playerName}</color> IS WINNER`
        this.isEndGame = true;
    }

    suddenDeathEvent() {
        this.SuddenDeathUI.active = true;
        // Stop timer
        this.timer = 0;
        this.disablePlayerDrag();

        this.scheduleOnce(() => {
            this.SuddenDeathUI.active = false;
            this.turnTime = this.suddentDeadthTimer; // 10s
            this.startTurnTimer();

            const player = this.players.find(p => p.id === 1);
            if (player && player.isAlive()) {
                this.enablePlayerDrag();
            }

        }, 3);
    }

    updatePlayerHealthUI(playerId: number) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const heartContainer = this.playerHeartContainers[playerId - 1];
        if (!heartContainer) return;

        const hearts = heartContainer.children;
        for (let i = 0; i < hearts.length; i++) {
            const heartSprite = hearts[i].getComponent(Sprite);
            if (heartSprite) {
                if (i < player.currentHealth) {
                    heartSprite.spriteFrame = this.heartRed;
                } else {
                    heartSprite.spriteFrame = this.heartGray;
                }
            }
        }
    }

    startTurnTimer() {
        this.playerHasPlayed = false;
        this.timer = this.turnTime;
        this.state = GameState.CardSelection;
        if (!this.suddentDeathEvent) this.turnLabel.string = `Turn ${this.turnCount}`;
        else this.turnLabel.string = `SUDDEN DEATH!`;

        const player = this.players.find(p => p.id === 1);
        if (this.dropZone) {
            const dropSprite = this.dropZone.getComponent(Sprite);
            if (dropSprite) {
                if (player && !player.isAlive()) {

                    this.disablePlayerDrag();

                    resources.load("botCard/CardBehind/spriteFrame", SpriteFrame, (err, sf) => {
                        if (!err) dropSprite.spriteFrame = sf;
                    });

                } else {
                    resources.load('botCard/playcard_bg/spriteFrame', SpriteFrame, (err, sf) => {
                        if (!err) dropSprite.spriteFrame = sf;
                    });
                }
            }
        }

        resources.load("botCard/CardBehind/spriteFrame", SpriteFrame, (err, sf) => {

            this.botSpriteNodes.forEach((botNode) => {
                const botSprite = botNode.getComponent(Sprite);
                if (botSprite) botSprite.spriteFrame = sf;
            });
        });
    }
}


