import { _decorator, Component, instantiate, Label, Node, Prefab } from 'cc'
import { EXPType, HPType, MPType, SkillType } from '../../Constant/Enum'
import { AttackAttr } from '../Attack/AttackAttr'
import { DefenseAttr } from '../Attack/DefenseAttr'
const { ccclass, property } = _decorator

@ccclass('PlayerStateManager')
export class PlayerStateManager extends Component {
    public static Instance: PlayerStateManager = null
    // 当前等级
    private Level: number = 0
    // 最大经验值
    private MaxEXP: number = 100
    // 当前经验值
    private EXP: number = 0
    // 最大生命
    private MaxHP: number = 120
    // 当前生命
    private HP: number = 120
    // 攻击
    public attackAttr: AttackAttr = new AttackAttr()
    // 防御
    public defenseAttr: DefenseAttr = new DefenseAttr()

    public Init() {
        if (PlayerStateManager.Instance === null) {
            PlayerStateManager.Instance = this
        }
    }
}

