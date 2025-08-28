import { _decorator, Component, Node, Input, EventTouch, UITransform, Vec3, Sprite } from 'cc';
import { GamePlayManager } from './GamePlayManager';
import { Card } from './Card';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('DragAndDropCard')
export class DragAndDropCard extends Component {

    public dropZone: Node;
    public gamePlayManager: GamePlayManager;
    public cardData: Card;

    private isDragging: boolean = false;
    private startPos: Vec3 = new Vec3();

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        this.isDragging = true;
        this.startPos.set(this.node.position);
    }

    onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;
        const delta = event.getUIDelta();
        this.node.setPosition(
            this.node.position.x + delta.x,
            this.node.position.y + delta.y
        );
    }

    onTouchEnd(event: EventTouch) {
        if (!this.isDragging) return;
        this.isDragging = false;

        if (this.dropZone && this.isInDropZone()) {
            console.log("Dropped into DropZone!");
            SoundSystem.instance.onPlayCorrectSound();
            const cardSprite = this.node.getComponent(Sprite);

            if (cardSprite && this.gamePlayManager) {
                this.gamePlayManager.playerPlayedCard(cardSprite.spriteFrame, this.cardData);
            }

            // Destroy card after play
            this.node.destroy();

        } else {
            // Go back to current pos
            this.node.setPosition(this.startPos);
            SoundSystem.instance.onPlayWrongSound();
            console.log("Return To Start Pos!");
        }
    }

    private isInDropZone(): boolean {
        if (!this.dropZone) return false;

        const cardBox = this.node.getComponent(UITransform)?.getBoundingBoxToWorld();
        const dropBox = this.dropZone.getComponent(UITransform)?.getBoundingBoxToWorld();

        if (cardBox && dropBox) {
            return dropBox.intersects(cardBox);
        }
        return false;
    }
}


