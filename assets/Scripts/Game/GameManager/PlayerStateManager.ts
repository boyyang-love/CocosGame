import { HPTYPE } from "../../Constant/Enum"
import { AttackAttr } from "../Attack/AttackAttr"
import { DefenseAttr } from "../Attack/DefenseAttr"

export class PlayerStateManager {
    public static Instance: PlayerStateManager = null
    // 当前等级
    public Level: number = 0
    // 最大经验值
    public MaxEXP: number = 300
    // 当前经验值
    public EXP: number = 0
    // 最大生命
    public MaxHP: number = 1000
    // 当前生命
    public HP: number = 1000
    // 攻击
    public attackAttr: AttackAttr = new AttackAttr()
    // 防御
    public defenseAttr: DefenseAttr = new DefenseAttr()

    public Init() {
        if (PlayerStateManager.Instance === null) {
            PlayerStateManager.Instance = new PlayerStateManager()
        }
    }

    public setEXP(exp: number) {
        this.EXP += exp
        if(this.EXP > this.MaxEXP) {
            this.Level += 1
            this.EXP = this.EXP - this.MaxEXP
        }
    }

    public setHp(hp: number, type: HPTYPE) {
        if(type === HPTYPE.HP) {
            this.HP = this.HP + hp
        }

        if(type === HPTYPE.HPMax) {
            this.MaxHP = this.MaxHP + hp
        }
    }
}

