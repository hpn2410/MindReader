import { _decorator, Component, director, Node } from 'cc';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('UIGamePlay')
export class UIGamePlay extends Component {
    @property(Node) settingPanel: Node;
    @property(Node) infoPanel: Node;

    onSettingBtnClicked() {
        this.settingPanel.active = true;
        this.onPlaySoundButtonPressed();
    }

    onInfoBtnClicked() {
        this.infoPanel.active = true;
        this.onPlaySoundButtonPressed();
    }

    onBackBtnClicked() {
        director.loadScene('MainMenu');
        this.onPlaySoundButtonPressed();
    }

    onPlaySoundButtonPressed() {
        SoundSystem.instance.onPlayButtonSound();
    }
}


