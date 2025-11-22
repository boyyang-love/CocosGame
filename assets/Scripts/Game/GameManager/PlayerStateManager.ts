import { _decorator, Component, instantiate, Label, Node, Prefab } from 'cc'
import { EXPType, HPType, MPType, SkillType } from '../../Constant/Enum'
import { AttackAttr } from '../Attack/AttackAttr'
import { DefenseAttr } from '../Attack/DefenseAttr'
import { DamageCalculator } from '../Attack/DamageCalculator'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Pop } from '../../Pop/Pop'
const { ccclass, property } = _decorator

export interface OwnSkill {
    skillId: string
    level: number
}

export interface PlayerStatus {
    Level: number
    MaxEXP: number
    EXP: number
    MaxHP: number
    HP: number
    MaxMP: number
    MP: number
    ATK: number
    DEF: number
}

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
    // 当前蓝量
    private MP: number = 100
    // 最大蓝量
    private MaxMP: number = 100
    // 当前攻击力
    private ATK: number = 100
    // 当前防御力
    private DEF: number = 50
    // 攻击
    public attackAttr: AttackAttr = new AttackAttr()
    // 防御
    public defenseAttr: DefenseAttr = new DefenseAttr()
    // 当前拥有的攻击技能
    private attackSkills: Map<string, OwnSkill>
    // 当前拥有的防御技能
    private defensiveSkills: Map<string, OwnSkill>

    public Init() {
        if (PlayerStateManager.Instance === null) {
            PlayerStateManager.Instance = this
        }
    }

    public setEXP(exp: number, type: EXPType) {
        if (type === EXPType.EXP) {
            if (this.EXP + exp >= this.MaxEXP) {
                this.Level += 1
                this.EXP = this.EXP + exp - this.MaxEXP
            } else {
                this.EXP = this.EXP + exp
            }
        } else {
            this.MaxEXP += exp
        }
    }

    public setHP(hp: number, type: HPType) {
        if (type === HPType.HP) {
            if (hp <= this.MaxHP) {
                this.HP = hp
            } else {
                this.HP = this.MaxHP
            }
        } else {
            this.MaxHP = hp
        }
    }

    public setMP(mp: number, type: MPType) {
        if (type === MPType.MP) {
            if (mp <= this.MaxMP) {
                this.MP = mp
            } else {
                this.MP = this.MaxMP
            }
        } else {
            this.MaxMP = mp
        }
    }

    public setATK(atk: number) {
        this.ATK = atk
    }

    public setDEF(def: number) {
        this.DEF = def
    }

    public getPlayerStatus(): PlayerStatus {
        return {
            Level: this.Level,
            MaxEXP: this.MaxEXP,
            EXP: this.EXP,
            MaxHP: this.MaxHP,
            HP: this.HP,
            MP: this.MP,
            MaxMP: this.MaxMP,
            ATK: this.ATK,
            DEF: this.DEF,
        }
    }

    public setSkills(skillId: string, level: number, skillType: SkillType) {
        if (skillType === SkillType.ATK) {
            this.attackSkills.set(skillId, {
                skillId: skillId,
                level: level
            })
        } else {
            this.defensiveSkills.set(skillId, {
                skillId: skillId,
                level: level
            })
        }
    }
}

