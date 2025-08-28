import { _decorator, Component, Node } from 'cc';
import { UIMainMenu } from './UIMainMenu';
import { SoundSystem } from '../System/SoundSystem';
const { ccclass, property } = _decorator;

@ccclass('UIRules')
export class UIRules extends Component {
    @property({
        type: Node,
        tooltip: 'Rules Panel'
    })
    public rulesPanel: Node;

    @property({
        type: UIMainMenu,
        tooltip: 'UI Main Menu'
    })
    public mainMenuScript: UIMainMenu;

    onClosedButtonClicked() {
        this.rulesPanel.active = false;
        this.mainMenuScript.buttonSetting.interactable = true;
        this.mainMenuScript.buttonStart.interactable = true;
        this.onPlayButtonClickedSound();
    }

    onClosedInfoButtonClickedGamePlayUI() {
        this.rulesPanel.active = false;
        this.onPlayButtonClickedSound();
    }

    onPlayButtonClickedSound() {
        SoundSystem.instance.onPlayButtonSound();
    }
}


