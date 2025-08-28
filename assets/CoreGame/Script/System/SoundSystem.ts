import { _decorator, AudioSource, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundSystem')
export class SoundSystem extends Component {

    // Declare singleton
    public static instance: SoundSystem = null;

    @property(AudioSource) public backgroundMusic: AudioSource;
    @property(AudioSource) public buttonPressSoundEffect: AudioSource;
    @property(AudioSource) public beingHitSoundEffect: AudioSource;
    @property(AudioSource) public correctSoundEffect: AudioSource;
    @property(AudioSource) public wrongSoundEffect: AudioSource;

    public isAllowPlayEffect: boolean = true;

    onLoad() {
        // Singleton Initialize
        if (SoundSystem.instance && SoundSystem.instance !== this) {
            this.node.destroy();
            return;
        }
        SoundSystem.instance = this;

        // Don't destroy this node when load a new scene
        director.addPersistRootNode(this.node);
    }

    onPlayButtonSound() {
        if (this.isAllowPlayEffect) {
            this.buttonPressSoundEffect.play();
        }
    }

    onPlayBeingHitSound() {
        if (this.isAllowPlayEffect) {
            this.beingHitSoundEffect.play();
        }
    }

    onPlayCorrectSound() {
        if (this.isAllowPlayEffect) {
            this.correctSoundEffect.play();
        }
    }

    onPlayWrongSound() {
        if (this.isAllowPlayEffect) {
            this.wrongSoundEffect.play();
        }
    }

    onEnableMusic() {
        this.backgroundMusic.play();
        this.backgroundMusic.loop = true;
    }

    onDisableMusic() {
        this.backgroundMusic.stop();
    }

    onSetEffect(isActive: boolean) {
        this.isAllowPlayEffect = isActive;
    }
}


