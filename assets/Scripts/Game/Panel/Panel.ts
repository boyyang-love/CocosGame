import { _decorator, Component, instantiate, Prefab, tween, Node } from 'cc'
import { PlayerStateManager } from '../GameManager/PlayerStateManager'
import { HPTYPE } from '../../Constant/Enum'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { PanelItem } from './PanelItem'
import { Config } from 'db://assets/Types/Config'
const { ccclass, property } = _decorator

@ccclass('Panel')
export class Panel extends Component {
    public static Instance: Panel = null
    public id: number = 0

    private propertyConfig: Config.PropertyConfig[][] = []
    private curPropertyConfig: Config.PropertyConfig[] = []

    private skillConfig: Config.SkillConfig[][] = []
    private curSkillConfig: Config.SkillConfig[] = []

    private lock: boolean = false
    private panelType: string = "property"

    protected onLoad() {
        if (Panel.Instance === null) {
            Panel.Instance = this
        } else {
            this.destroy()
        }
    }

    start() {
        this.node.on("panelClick", (_, id: number) => {
            console.log(`点击-${id}`)
        })
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

    public setPanelCard(propertyConfig: Config.PropertyConfig[]) {
        this.propertyConfig.push(propertyConfig)
    }

    public setSkillPanelCard(skillConfig: Config.SkillConfig[]) {
        this.skillConfig.push(skillConfig)
    }

    showPanel() {
        if (this.skillConfig.length) {
            if (!this.lock) {
                this.lock = true
                this.panelType = "skill"
                const skillConfig = this.skillConfig.shift()
                this.curSkillConfig = skillConfig
                this.id = this.curSkillConfig[0].id

                const PanelItemsNode = this.node.getChildByName("PanelItems")
                PanelItemsNode.removeAllChildren()
                skillConfig.forEach(async config => {
                    const node = await this.createPanel(config.id, config.name, config.desc)
                    PanelItemsNode.addChild(node)
                })
                this.open()
            }

            return
        }
        if (this.propertyConfig.length) {
            if (!this.lock) {
                this.lock = true
                this.panelType = "property"
                const propertyConfig = this.propertyConfig.shift()
                this.curPropertyConfig = propertyConfig
                this.id = this.curPropertyConfig[0].id

                const PanelItemsNode = this.node.getChildByName("PanelItems")
                PanelItemsNode.removeAllChildren()
                propertyConfig.forEach(async config => {
                    const node = await this.createPanel(config.id, config.name, config.desc, config.rarity)
                    PanelItemsNode.addChild(node)
                })
                this.open()
            }

            return
        }
    }

    buttonClick() {
        if(this.panelType === "skill") {
            this.setSkill()
            return
        }
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

        this.close()
        this.scheduleOnce(() => {
            this.lock = false
        }, 1)
    }

    setSkill(){
        const skillConfig = this.curSkillConfig.filter(c => c.id === this.id)[0]
        console.log(skillConfig)
        PlayerStateManager.Instance.setArms(skillConfig)
        this.close()
        this.scheduleOnce(() => {
            this.lock = false
        })
    }

    async createPanel(id: number, title: string, content: string, rarity?: string): Promise<Node> {
        const panelItemPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Panel/PanelItem", Prefab)
        const panelItemNode = instantiate(panelItemPrefab)
        const panelItemScript = panelItemNode.getComponent(PanelItem)

        panelItemScript.setItems(id, title, content, rarity)

        return panelItemNode
    }
}

