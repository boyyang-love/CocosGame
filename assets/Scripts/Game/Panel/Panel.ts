import { _decorator, Component, instantiate, Prefab, tween, Node } from 'cc'
import { PlayerStateManager } from '../GameManager/PlayerStateManager'
import { ASSETPATH, HPTYPE, SKILLPROPERTYEFFECT } from '../../Constant/Enum'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { PanelItem } from './PanelItem'
import { Config } from 'db://assets/Types/Config'
import { PlayerManager } from '../GameManager/PlayerManager'
import { GameManager } from '../Framework/Managers/GameManager'
const { ccclass, property } = _decorator

export enum PanelType {
    Property,
    Skill,
    SkillProperty
}

@ccclass('Panel')
export class Panel extends Component {
    public static Instance: Panel = null
    public id: number = 0

    private propertyConfig: Config.PropertyConfig[][] = []
    private curPropertyConfig: Config.PropertyConfig[] = []

    private skillConfig: Config.SkillConfig[][] = []
    private curSkillConfig: Config.SkillConfig[] = []

    private skillPropertyConfig: Config.SkillPropertyConfig[][] = []
    private curSkillProperyConfig: Config.SkillPropertyConfig[] = []

    private lock: boolean = false
    private panelType: PanelType = PanelType.Property

    private panelItems: Map<string, Node> = new Map()

    protected onLoad() {
        if (Panel.Instance === null) {
            Panel.Instance = this
        } else {
            this.destroy()
        }
    }

    update(deltaTime: number) {
        this.showPanel()
    }

    public open() {
        tween(this.node)
            .to(0.5, {
                y: 0,
            })
            .call(() => {
                GameManager.getInstance().pause()
            })
            .start()
    }

    public close() {
        GameManager.getInstance().play()
        tween(this.node)
            .to(0.5, {
                y: 2000,
            })
            .start()
    }

    public setPropertyConfigPanelCard(propertyConfig: Config.PropertyConfig[]) {
        this.propertyConfig.push(propertyConfig)
    }

    public setSkillConfigPanelCard(skillConfig: Config.SkillConfig[]) {
        this.skillConfig.push(skillConfig)
    }

    public setSkillPropertyConfigPanelCard(skillPropertyConfig: Config.SkillPropertyConfig[]) {
        this.skillPropertyConfig.push(skillPropertyConfig)
    }

    showPanel() {
        if (this.skillConfig.length) {
            if (!this.lock) {
                this.lock = true
                this.panelType = PanelType.Skill
                const skillConfig = this.skillConfig.shift()
                this.curSkillConfig = skillConfig
                this.id = this.curSkillConfig[0].id

                const PanelItemsNode = this.node.getChildByName("PanelItems")
                PanelItemsNode.removeAllChildren()
                this.panelItems.clear()
                skillConfig.forEach(async (config, i) => {
                    const node = await this.createPanel(config.id, config.name, config.desc)
                    PanelItemsNode.addChild(node)
                    const panelItemScript = node.getComponent(PanelItem)
                    if (i === 0) {
                        panelItemScript.setSelect(true)
                    } else {
                        panelItemScript.setSelect(false)
                    }
                    this.panelItems.set(node.uuid, node)
                })
                this.open()
            }

            return
        }

        if (this.propertyConfig.length) {
            if (!this.lock) {
                this.lock = true
                this.panelType = PanelType.Property
                const propertyConfig = this.propertyConfig.shift()
                this.curPropertyConfig = propertyConfig
                this.id = this.curPropertyConfig[0].id

                const PanelItemsNode = this.node.getChildByName("PanelItems")
                PanelItemsNode.removeAllChildren()
                this.panelItems.clear()
                propertyConfig.forEach(async (config, i) => {
                    const node = await this.createPanel(config.id, config.name, config.desc, config.rarity)
                    PanelItemsNode.addChild(node)
                    const panelItemScript = node.getComponent(PanelItem)
                    if (i === 0) {
                        panelItemScript.setSelect(true)
                    } else {
                        panelItemScript.setSelect(false)
                    }
                    this.panelItems.set(node.uuid, node)
                })
                this.open()
            }

            return
        }

        if (this.skillPropertyConfig.length) {
            if (!this.lock) {
                this.lock = true
                this.panelType = PanelType.SkillProperty
                const skillPropertyConfig = this.skillPropertyConfig.shift()
                this.curSkillProperyConfig = skillPropertyConfig
                this.id = this.curSkillProperyConfig[0].id

                const PanelItemsNode = this.node.getChildByName("PanelItems")
                PanelItemsNode.removeAllChildren()
                this.panelItems.clear()
                skillPropertyConfig.forEach(async (config, i) => {
                    const node = await this.createPanel(config.id, config.name, config.desc)
                    PanelItemsNode.addChild(node)
                    const panelItemScript = node.getComponent(PanelItem)
                    if (i === 0) {
                        panelItemScript.setSelect(true)
                    } else {
                        panelItemScript.setSelect(false)
                    }
                    this.panelItems.set(node.uuid, node)
                })
                this.open()
            }
        }
    }

    buttonClick() {
        if (this.panelType === PanelType.Skill) {
            this.setSkill()
            return
        }

        if (this.panelType === PanelType.Property) {
            const propertyConfig = this.curPropertyConfig.filter(c => c.id === this.id)[0]
            // 攻击
            if (propertyConfig.effectType === Config.effectType.AttackAttr) {
                const keys = Object.keys(propertyConfig.effects)
                keys.forEach((key) => {
                    PlayerStateManager.Instance.setAttackAttr(key, propertyConfig.effects[key])
                })
            }

            // 防御
            if (propertyConfig.effectType === Config.effectType.DefenseAttr) {
                const keys = Object.keys(propertyConfig.effects)
                keys.forEach((key) => {
                    PlayerStateManager.Instance.setDefenseAttr(key, propertyConfig.effects[key])
                })
            }

            // HP
            if (propertyConfig.effectType === Config.effectType.HP) {
                const keys = Object.keys(propertyConfig.effects)
                keys.forEach((key) => {
                    PlayerStateManager.Instance.setHp(propertyConfig.effects[key], HPTYPE.HP)
                })
            }
        }

        if (this.panelType === PanelType.SkillProperty) {
            const skillPropertyConfig = this.curSkillProperyConfig.filter(c => c.id === this.id)[0]
            const keys = Object.keys(skillPropertyConfig.effects)
            keys.forEach(key => {
                PlayerStateManager.Instance.setSkillProperty(skillPropertyConfig.id, key, skillPropertyConfig.effects[key], skillPropertyConfig.effectType)
            })
        }


        this.close()
        this.scheduleOnce(() => {
            this.lock = false
        }, 1)
    }

    setSkill() {
        const skillConfig = this.curSkillConfig.filter(c => c.id === this.id)[0]
        PlayerManager.Instance.mountSkill(skillConfig.id)
        this.close()
        this.scheduleOnce(() => {
            this.lock = false
        })
    }

    async createPanel(id: number, title: string, content: string, rarity?: string): Promise<Node> {
        const panelItemPrefab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "Panel/PanelItem", Prefab)
        const panelItemNode = instantiate(panelItemPrefab)
        const panelItemScript = panelItemNode.getComponent(PanelItem)

        panelItemScript.setItems(id, title, content, rarity)

        return panelItemNode
    }

    setChecked(id: string) {
        this.panelItems.forEach((node, key) => {
            if (key !== id) {
                const panelItemScript = node.getComponent(PanelItem)
                panelItemScript.setSelect(false)
            }
        })
    }
}

