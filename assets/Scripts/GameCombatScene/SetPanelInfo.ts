import { _decorator, Animation, Component, EventTouch, instantiate, Label, Node, Prefab, tween } from 'cc'
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
const { ccclass, property } = _decorator

@ccclass('SetPanelInfo')
export class SetPanelInfo extends Component {
    private attackLabelNodes: Node[] = []
    private defenseLabelNode: Node[] = []

    start() {
        this.setAttackLabel()
        this.setDefenseLabel()
    }

    update(deltaTime: number) {
        this.updateAttackLabelValue()
        this.updateDefenseLabelValue()
    }

    setAttackLabel() {
        const labels = [
            {
                key: "basePhysicalDamage",
                text: "基础物理伤害"
            },
            {
                key: "baseMagicDamage",
                text: "基础魔法伤害"
            },
            {
                key: "physicalAttackPower",
                text: "物理攻击力",
            },
            {
                key: "magicAttackPower",
                text: "魔法攻击力",
            },
            {
                key: "critRate",
                text: "暴击率",
            },
            {
                key: "critDamage",
                text: "暴击倍率",
            },
            {
                key: "physicalDamageBoost",
                text: "物理伤害增幅",
            },
            {
                key: "magicDamageBoost",
                text: "魔法伤害增幅"
            },
            {
                key: "extraPhysicalDamage",
                text: "额外固定物理伤害",
            },
            {
                key: "extraMagicDamage",
                text: "额外固定魔法伤害"
            }
        ]

        labels.forEach(async label => {
            const panelInfoPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Panel/PanelInfo", Prefab)
            const panelInfoNode = instantiate(panelInfoPrefab)
            const nameLabelNode = panelInfoNode.getChildByName("Name")
            const valueLabelNode = panelInfoNode.getChildByName("Value")
            panelInfoNode.name = label.key
            nameLabelNode.getComponent(Label).string = label.text
            valueLabelNode.getComponent(Label).string = PlayerStateManager.Instance.attackAttr[label.key]
            this.node.getChildByName("AttackPanel").addChild(panelInfoNode)
            this.attackLabelNodes.push(panelInfoNode)
        })
    }

    setDefenseLabel() {
        const labels = [
            {
                key: "basePhysicalDefense",
                text: "基础物理防御"
            },
            {
                key: "baseMagicDefense",
                text: "基础魔法防御"
            },
            {
                key: "physicalDefenseBoost",
                text: "物理防御力",
            },
            {
                key: "magicDefenseBoost",
                text: "魔法防御力",
            },
            {
                key: "extraPhysicalDefense",
                text: "额外物理防御",
            },
            {
                key: "extraMagicDamage",
                text: "额外魔法防御",
            },
            {
                key: "physicalDamageReduction",
                text: "物理减伤",
            },
            {
                key: "magicDamageReduction",
                text: "魔法减伤"
            },
        ]

        labels.forEach(async label => {
            const panelInfoPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Panel/PanelInfo", Prefab)
            const panelInfoNode = instantiate(panelInfoPrefab)
            const nameLabelNode = panelInfoNode.getChildByName("Name")
            const valueLabelNode = panelInfoNode.getChildByName("Value")
            panelInfoNode.name = label.key
            nameLabelNode.getComponent(Label).string = label.text
            valueLabelNode.getComponent(Label).string = PlayerStateManager.Instance.defenseAttr[label.key]
            this.node.getChildByName("DefensePanel").addChild(panelInfoNode)
            this.defenseLabelNode.push(panelInfoNode)
        })
    }

    public panelopen(_: Event, name: string) {
        
        const attackPanelNode = this.node.getChildByName(name)
        tween(attackPanelNode)
            .to(0.5, {
                x: 0,
                y: 0,
            })
            .start()
    }

    public panelClose(_: Event, name: string) {
        const attackPanelNode = this.node.getChildByName(name)
        tween(attackPanelNode)
            .to(0.5, {
                x: -1000,
                y: 0,
            })
            .start()
    }

    updateAttackLabelValue() {
        if (this.attackLabelNodes.length) {
            this.attackLabelNodes.forEach(labelNode => {
                const valueNode = labelNode.getChildByName("Value")
                const valueLabel = valueNode.getComponent(Label)
                valueLabel.string = PlayerStateManager.Instance.attackAttr[labelNode.name]
            })
        }
    }

    updateDefenseLabelValue() {
        if (this.defenseLabelNode.length) {
            this.defenseLabelNode.forEach(labelNode => {
                const valueNode = labelNode.getChildByName("Value")
                const valueLabel = valueNode.getComponent(Label)
                valueLabel.string = PlayerStateManager.Instance.defenseAttr[labelNode.name]
            })
        }
    }
}

