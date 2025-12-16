import { math, Node, Prefab, instantiate } from "cc"
import { ASSETPATH, CUSTOMEVENTNAME, HPTYPE, SKILLPROPERTYEFFECT } from "../../Constant/Enum"
import { AttackAttr } from "../Attack/AttackAttr"
import { DefenseAttr } from "../Attack/DefenseAttr"
import { SkillManager } from "./SkillManager"
import { Panel } from "../Panel/Panel"
import { Config } from 'db://assets/Types/Config'
import { EventManager } from "../Framework/Managers/EventManager"
import { ResourceManager } from "../Framework/Managers/ResourceManager"
import { randomPickFromNumberSet } from "../../Utils/RandomPickFromNumberSet"

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

    // 设置经验
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

    // 设置hp
    public setHp(hp: number, type: HPTYPE) {
        if (type === HPTYPE.HP) {
            this.HP = math.clamp(this.HP + hp, 0, this.MaxHP)
        }

        if (type === HPTYPE.HPMax) {
            this.MaxHP = this.MaxHP + hp
        }
    }


    // 设置技能各项属性值
    public setSkillProperty(id: number, key: string, value: number, type: string) {
        this.skills.forEach(s => {
            if (s.id === id) {
                if (s[type][key]) {
                    s[type][key] = Number((s[type][key] + value).toFixed(2))
                }
            }
        })
    }

    // 随机获取属性
    public getProperty() {
        const ids = SkillManager.getInstance().propertyConfigsId
        const randomId = randomPickFromNumberSet(ids)
        const infos = randomId.map(id => {
            return {
                ...SkillManager.getInstance().getPropertyConfigInfoById(id)
            }
        })

        Panel.Instance.setPropertyConfigPanelCard(infos)
    }

    // 随机获取技能属性
    public getSkillProperty() {
        const ids = SkillManager.getInstance().skillPropertyConfigsId
        const randomId = randomPickFromNumberSet(ids)

        const infos = randomId.map(id => {
            return {
                ...SkillManager.getInstance().getSkillPropertyInfoById(id)
            }
        })
    }

    // 随机获取技能
    public getSkill() {
        const ids = SkillManager.getInstance().skillConfigsId
        const randomId = randomPickFromNumberSet(ids)
        const infos = randomId.map(id => {
            return {
                ...SkillManager.getInstance().getSkillConfigInfoById(id)
            }
        })

        Panel.Instance.setSkillConfigPanelCard(infos)
    }

    // 设置攻击属性
    public setAttackAttr(key: string, valule: number) {
        this.attackAttr[key] = Number((this.attackAttr[key] + valule).toFixed(2))
    }

    // 设置防御属性
    public setDefenseAttr(key: string, valule: number) {
        this.defenseAttr[key] = Number((this.defenseAttr[key] + valule).toFixed(2))
    }

    // 设置技能
    public setSkill(skill: Config.SkillConfig) {
        this.skills.push(skill)
        EventManager.instance.emit(CUSTOMEVENTNAME.SKILLCHANGE)
    }

    // 删除技能
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

