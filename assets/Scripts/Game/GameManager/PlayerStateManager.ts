import { math } from "cc"
import { HPTYPE } from "../../Constant/Enum"
import { AttackAttr } from "../Attack/AttackAttr"
import { DefenseAttr } from "../Attack/DefenseAttr"
import { SkillConfigManager } from "../Framework/Managers/SkillConfigManager"
import { SkillPanel } from "../SkillPanel/SkillPanel"

export class PlayerStateManager {
    public static Instance: PlayerStateManager = null
    // 当前等级
    public Level: number = 0
    // 最大经验值
    public MaxEXP: number = 300
    // 当前经验值
    public EXP: number = 0
    // 最大生命
    public MaxHP: number = 100
    // 当前生命
    public HP: number = 100
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
        if (this.EXP > this.MaxEXP) {
            this.Level += 1
            this.EXP = this.EXP - this.MaxEXP
            this.getSkill()
        }
    }

    public setHp(hp: number, type: HPTYPE) {
        if (type === HPTYPE.HP) {
            console.log(`增加---${hp}`)
            this.HP = math.clamp(this.HP + hp, 0, this.MaxHP)
        }

        if (type === HPTYPE.HPMax) {
            this.MaxHP = this.MaxHP + hp
        }
    }

    public getSkill() {
        const skillId = SkillConfigManager.Instance.skillId
        const randomId = this.randomPickFromNumberSet(skillId, 3)
        const infos = randomId.map(id => {
            return SkillConfigManager.Instance.getSkillConfig(id)
        })
        SkillPanel.Instance.setPanelCard(infos)
    }

    public setAttackAttr(key: string, valule: number) {
        this.attackAttr[key] = Number((this.attackAttr[key] + valule).toFixed(2))
    }

    public setDefenseAttr(key: string, valule: number) {
        this.defenseAttr[key] = Number((this.defenseAttr[key] + valule).toFixed(2))
    }

    randomPickFromNumberSet(set: Set<number>, count: number = 3): number[] {
        const arr = Array.from(set)
        if (arr.length <= count) return [...arr]

        // Fisher-Yates 洗牌（打乱数组前 count 个元素）
        for (let i = 0; i < count; i++) {
            const randomIndex = i + Math.floor(Math.random() * (arr.length - i));
            // 交换当前索引与随机索引的元素
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]
        }

        // 返回前 count 个元素（已打乱且无重复）
        return arr.slice(0, count)
    }

}

