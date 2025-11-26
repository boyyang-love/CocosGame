import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
const { ccclass, property } = _decorator;

@ccclass('SetPlayerState')
export class SetPlayerState extends Component {
    @property({ tooltip: "当前等级", type: Label })
    LevelLabel: Label = null
    @property({ tooltip: "经验条", type: ProgressBar })
    EXPProgressBar: ProgressBar = null
    @property({tooltip: "角色血量", type: ProgressBar})
    HPProgressBar: ProgressBar = null

    start() {

    }

    update(deltaTime: number) {
        this.updateState()
    }

    updateState(){
        this.LevelLabel.string = PlayerStateManager.Instance.Level.toString()
        this.EXPProgressBar.progress = Number((PlayerStateManager.Instance.EXP / PlayerStateManager.Instance.MaxEXP).toFixed(1))
        this.HPProgressBar.progress = Number((PlayerStateManager.Instance.HP / PlayerStateManager.Instance.MaxHP).toFixed(1))
    }
}

