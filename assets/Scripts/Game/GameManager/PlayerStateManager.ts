import { math, Node, Prefab, EventTarget, instantiate } from "cc"
import { ARMSTYPE, ASSETPATH, ATTACKMETHOD, CUSTOMEVENTNAME, HPTYPE, OWNERTYPE, } from "../../Constant/Enum"
import { AttackAttr } from "../Attack/AttackAttr"
import { DefenseAttr } from "../Attack/DefenseAttr"
import { SkillManager } from "./SkillManager"
import { Panel } from "../Panel/Panel"
import { Config } from 'db://assets/Types/Config'
import { AutoAttack } from "../Attack/AutoAttack"
import { EventManager } from "../Framework/Managers/EventManager"
import { ResourceManager } from "../Framework/Managers/ResourceManager"

export class PlayerStateManager {
    public static Instance: PlayerStateManager = null
    public PlayerNode: Node = null
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
    // 技能列表
    public skills: Config.SkillConfig[] = []

    public Init() {
        if (PlayerStateManager.Instance === null) {
            PlayerStateManager.Instance = new PlayerStateManager()
            SkillManager.getInstance().loadConfigs()
        }
    }

    public setEXP(exp: number) {
        this.EXP += exp
        if (this.EXP > this.MaxEXP) {
            this.Level += 1
            this.EXP = this.EXP - this.MaxEXP
            this.createAni().then(() => {
                if (this.Level % 5 === 0) {
                    this.getSkill()
                } else {
                    this.getProperty()
                }
            })
        }
    }

    public setHp(hp: number, type: HPTYPE) {
        if (type === HPTYPE.HP) {
            this.HP = math.clamp(this.HP + hp, 0, this.MaxHP)
        }

        if (type === HPTYPE.HPMax) {
            this.MaxHP = this.MaxHP + hp
        }
    }

    public setSkillProperty(id: number, key: string, value: number) {
        this.skills.forEach(s => {
            if (s.id === id) {
                if (s.armsProp[key]) {
                    s.armsProp[key] = Number((s.armsProp[key] + value).toFixed(2))
                }
            }
        })
    }

    public getProperty() {
        const ids = SkillManager.getInstance().propertyConfigsId
        const randomId = this.randomPickFromNumberSet(ids)
        const infos = randomId.map(id => {
            return {
                ...SkillManager.getInstance().getPropertyConfigInfoById(id)
            }
        })

        Panel.Instance.setPanelCard(infos)
    }

    public getSkill() {
        const ids = SkillManager.getInstance().skillConfigsId
        const randomId = this.randomPickFromNumberSet(ids)
        const infos = randomId.map(id => {
            return {
                ...SkillManager.getInstance().getSkillConfigInfoById(id)
            }
        })

        Panel.Instance.setSkillPanelCard(infos)
    }

    public setAttackAttr(key: string, valule: number) {
        this.attackAttr[key] = Number((this.attackAttr[key] + valule).toFixed(2))
    }

    public setDefenseAttr(key: string, valule: number) {
        this.defenseAttr[key] = Number((this.defenseAttr[key] + valule).toFixed(2))
    }

    public setSkill(skill: Config.SkillConfig) {
        this.skills.push(skill)
        EventManager.instance.emit(CUSTOMEVENTNAME.SKILLCHANGE)
    }

    public delSkill(id: number) {
        this.skills = this.skills.filter(s => s.id != id)
        EventManager.instance.emit(CUSTOMEVENTNAME.SKILLCHANGE)
    }

    public getSkillById(id: number): Config.SkillConfig {
        const info = this.skills.filter(s => s.id === id)
        if (info.length) {
            return info[0]
        }
        return null
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

    createAni() {
        return new Promise(async (resolve, reject) => {
            const wheelPrefab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "Effects/Wheel", Prefab)
            const wheelNode = instantiate(wheelPrefab)
            this.PlayerNode.addChild(wheelNode)
            wheelNode.setWorldPosition(this.PlayerNode.getWorldPosition())

            setTimeout(() => {
                this.PlayerNode.removeChild(wheelNode)
                resolve(true)
            }, 2000)
        })
    }
}

