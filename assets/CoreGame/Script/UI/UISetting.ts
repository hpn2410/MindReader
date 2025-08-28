import { _decorator, Color, color, Component, Node, Sprite } from 'cc';
import { UIMainMenu } from './UIMainMenu';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('UISetting')
export class UISetting extends Component {

    // Setting Panel
    @property({
        type: Node,
        tooltip: 'Setting Panel'
    })
    public settingPanel: Node;

    // Music Toggle
    @property({
        type: Node,
        tooltip: 'Music Toggle'
    })
    public musicToggle: Node;

    @property({
        type: Sprite,
        tooltip: 'Music Toggle BackGround'
    })
    public spriteMusicBg: Sprite;

    // Sound Effect Toggle
    @property({
        type: Node,
        tooltip: 'Sound Effect Toggle'
    })
    public soundEffectToggle: Node;

    @property({
        type: Sprite,
        tooltip: 'Music Toggle BackGround'
    })
    public spriteSoundEffectBg: Sprite;

    @property({
        type: color,
        tooltip: 'Change Color BackGround'
    })
    public colorBg: Color[] = []; // 0: Active, 1: Inactive

    @property({
        type: UIMainMenu,
        tooltip: 'UI Main Menu'
    })
    public mainMenuScript: UIMainMenu;

    isOnMusicToggle: boolean = false;
    isOnSoundEffectToggle: boolean = false;

    onClosedSettingButtonClicked() {
        this.settingPanel.active = false;
        this.mainMenuScript.buttonRules.interactable = true;
        this.mainMenuScript.buttonStart.interactable = true;
        this.onPlayButtonClickedSound();
    }

    onClosedSettingButtonClickedGamePlayUI() {
        this.settingPanel.active = false;
        this.onPlayButtonClickedSound();
    }

    onSetMusicToggle() {
        if (this.isOnMusicToggle) {
            this.isOnMusicToggle = false;
            this.spriteMusicBg.color = this.colorBg[0];
            SoundSystem.instance.onEnableMusic();
        }
        else {
            this.isOnMusicToggle = true;
            this.spriteMusicBg.color = this.colorBg[1];
            SoundSystem.instance.onDisableMusic();
        }

        this.musicToggle.setPosition((0 - this.musicToggle.position.x), 0, 0);
    }

    onSetSoundEffectToggle() {
        if (this.isOnSoundEffectToggle) {
            this.isOnSoundEffectToggle = false;
            this.spriteSoundEffectBg.color = this.colorBg[0];
            SoundSystem.instance.onSetEffect(true);
        }
        else {
            this.isOnSoundEffectToggle = true;
            this.spriteSoundEffectBg.color = this.colorBg[1];
            SoundSystem.instance.onSetEffect(false);
        }

        this.soundEffectToggle.setPosition((0 - this.soundEffectToggle.position.x), 0, 0);
    }

    onPlayButtonClickedSound() {
        SoundSystem.instance.onPlayButtonSound();
    }
}


