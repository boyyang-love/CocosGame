import { Skill } from './../../../Types/SkillConfig'
import { _decorator, Animation, Component, tween } from 'cc'
import { Panel } from './Panel'
import { PlayerStateManager } from '../GameManager/PlayerStateManager'
import { HPTYPE } from '../../Constant/Enum'
const { ccclass, property } = _decorator

@ccclass('SkillPanel')
export class SkillPanel extends Component {
    public static Instance: SkillPanel = null
    public index: number = 0

    private skillConfig: Skill.SkillConfig[][] = []
    private curSkillConfig: Skill.SkillConfig[] = []
    private lock: boolean = false

    protected onLoad() {
        if (SkillPanel.Instance === null) {
            SkillPanel.Instance = this
        } else {
            this.destroy()
        }
    }

    start() {

    }

    update(deltaTime: number) {
        this.showPanel()
    }

    public open() {
        tween(this.node)
            .to(0.5, {
                y: 0,
            })
            .start()
    }

    public close() {
        tween(this.node)
            .to(0.5, {
                y: 2000,
            })
            .start()
    }

    public setPanelCard(skillConfig: Skill.SkillConfig[]) {
        this.skillConfig.push(skillConfig)
        // this.node.children.filter(node => node.name === "SkillPanelItem").forEach((node, i) => {
        //     if (skillConfig[i]) {
        //         const panelScript = node.getComponent(Panel)
        //         panelScript.setValue(skillConfig[i].name, skillConfig[i].desc)
        //     }
        // })
    }

    showPanel() {
        if (this.skillConfig.length) {
            if (!this.lock) {
                this.lock = true
                const skillConfig = this.skillConfig.shift()
                this.curSkillConfig = skillConfig
                this.node.children.filter(node => node.name === "SkillPanelItem").forEach((node, i) => {
                    if (skillConfig[i]) {
                        const panelScript = node.getComponent(Panel)
                        panelScript.setValue(skillConfig[i].name, skillConfig[i].desc)
                    }
                })
                this.open()
            }
        }
    }

    buttonClick() {
        const skillConfig = this.curSkillConfig[this.index]
        // 攻击
        if (skillConfig.effectType === Skill.effectType.AttackAttr) {
            const keys = Object.keys(skillConfig.effects)
            keys.forEach((key) => {
                PlayerStateManager.Instance.setAttackAttr(key, skillConfig.effects[key])
            })
        }

        // 防御
        if (skillConfig.effectType === Skill.effectType.DefenseAttr) {
            const keys = Object.keys(skillConfig.effects)
            keys.forEach((key) => {
                PlayerStateManager.Instance.setDefenseAttr(key, skillConfig.effects[key])
            })
        }

        // HP
        if (skillConfig.effectType === Skill.effectType.HP) {
            const keys = Object.keys(skillConfig.effects)
            keys.forEach((key) => {
                PlayerStateManager.Instance.setHp(skillConfig.effects[key], HPTYPE.HP)
            })
        }

        this.close()
        this.scheduleOnce(() => {
            this.lock = false
        }, 1)
    }
}

