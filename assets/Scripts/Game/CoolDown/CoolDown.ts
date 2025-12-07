import { _decorator, Component, Node, Sprite } from 'cc'
import { PlayerManager } from '../GameManager/PlayerManager'
const { ccclass, property } = _decorator

@ccclass('CoolDown')
export class CoolDown extends Component {
    @property({ tooltip: "图标", type: Sprite })
    public icon: Sprite
    @property({ tooltip: "遮罩", type: Sprite })
    public mesk: Sprite

    public skillId: number
    // 冷却时间
    public collDown: number = 4

    start() {
        this.schedule(() => {
            this.mesk.fillRange = this.mesk.fillRange - (1 / this.collDown)
            if (this.mesk.fillRange <= 0) {
                this.mesk.fillRange = 1
                this.attack()
            }
        }, 1)
    }

    update(deltaTime: number) {

    }

    attack() {
        if (this.skillId) {
            PlayerManager.Instance.castSkill(this.skillId)
        }
    }
}

