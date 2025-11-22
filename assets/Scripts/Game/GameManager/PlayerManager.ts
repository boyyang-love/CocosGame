import { _decorator, Camera, Component, instantiate, Label, Node, Prefab } from 'cc'
import { AttackAttr } from '../Attack/AttackAttr'
import { DefenseAttr } from '../Attack/DefenseAttr'
import { DamageCalculator } from '../Attack/DamageCalculator'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Pop } from '../../Pop/Pop'
const { ccclass, property } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    // HP
    private HP: number = 100
    // 攻击
    public attackAttr: AttackAttr = new AttackAttr()
    // 防御
    public defenseAttr: DefenseAttr = new DefenseAttr()

    protected onLoad() {
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    // 被攻击时调用（由攻击方触发，如玩家子弹碰撞）
    public takeDamage(attackerAttr: AttackAttr) {
        // 计算伤害
        const { damage, isCrit } = DamageCalculator.calculateFinalDamage(attackerAttr, this.defenseAttr)

        // 应用伤害（扣除生命值等）
        this.reduceHealth(damage, isCrit)

    }

    private reduceHealth(damage: number, isCrit: boolean) {
        // 实现扣血逻辑（如怪物生命值 = 生命值 - damage）
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Effects/Boom", Prefab).then((prefab) => {
            const boomNode = instantiate(prefab)
            this.node.addChild(boomNode)
            boomNode.setWorldPosition(this.node.getWorldPosition())

            this.scheduleOnce(() => {
                if (boomNode.isValid) {
                    boomNode.destroy()
                }
            }, 2)
        })

        this.HP -= damage
        if (this.HP <= 0) {
            console.log("player die")
        } else {
            this.setPop(damage, isCrit)

        }

        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Effects/Boom", Prefab).then((prefab) => {
            const boomNode = instantiate(prefab)
            this.node.addChild(boomNode)
            boomNode.setWorldPosition(this.node.getWorldPosition())

            this.scheduleOnce(() => {
                if (boomNode.isValid) {
                    boomNode.destroy()
                }
            }, 2)
        })
    }

    private setPop(damage: number, isCrit: boolean) {
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Pop/pop", Prefab).then((Prefab) => {
            const popPrefab = instantiate(Prefab)
            // 是否暴击
            if (isCrit) {
                const labelNode = popPrefab.getChildByName("Label")
                const label = labelNode.getComponent(Label)
                label.enableOutline = true
            }
            this.node.addChild(popPrefab)
            const popScript = popPrefab.getComponent(Pop)
            popScript.setValue(damage)
            popPrefab.setWorldPosition(this.node.worldPosition)

            setTimeout(() => {
                popPrefab.destroy()
            }, 3000)
        })
    }
}

