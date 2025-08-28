import { _decorator, Button, Component, director, Node } from 'cc';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenu')
export class UIMainMenu extends Component {

    @property({
        type: Node,
        tooltip: 'Setting Panel'
    })
    public settingPanel: Node;

    @property({
        type: Node,
        tooltip: 'Rules Panel'
    })
    public rulesPanel: Node;

    @property({
        type: Node,
        tooltip: 'Start Game Panel'
    })
    public startGamePanel: Node;

    @property({
        type: Button,
        tooltip: 'Start Game Button'
    })
    public buttonStart: Button;

    @property({
        type: Button,
        tooltip: 'Setting Button'
    })
    public buttonSetting: Button;

    @property({
        type: Button,
        tooltip: 'Rules Button'
    })
    public buttonRules: Button;

    @property({
        type: String,
        tooltip: 'Scene Names'
    })
    public sceneName: string[] = [];

    onSettingButtonClicked() {
        this.settingPanel.active = true;
        this.buttonStart.interactable = false;
        this.buttonRules.interactable = false;
        this.onPlaySoundButtonPressed();
    }

    onRulesButtonClicked() {
        this.rulesPanel.active = true;
        this.buttonStart.interactable = false;
        this.buttonSetting.interactable = false;
        this.onPlaySoundButtonPressed();
    }

    onStartGameButtonClicked() {
        this.startGamePanel.active = true;
        this.buttonRules.interactable = false;
        this.buttonSetting.interactable = false;
        this.onPlaySoundButtonPressed();

        this.loadScene(this.sceneName[0]);
    }

    onPlaySoundButtonPressed() {
        SoundSystem.instance.onPlayButtonSound();
    }

    loadScene(sceneName: string) {
        director.loadScene(sceneName);
    }
}


