import { _decorator, Collider2D, Component, instantiate, Label, Node, Prefab, RigidBody2D } from 'cc'
import { DefenseAttr } from '../Attack/DefenseAttr'
import { AttackAttr } from '../Attack/AttackAttr'
import { DamageCalculator } from '../Attack/DamageCalculator'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Pop } from '../../Pop/Pop'
import { EnemyStoreManager } from './EnemyStoreManager'
const { ccclass, property } = _decorator

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    private HP: number = 1000
    private defenseAttr: DefenseAttr = new DefenseAttr()
    public attackAttr: AttackAttr = new AttackAttr()

    protected onLoad() {
        EnemyStoreManager.getInstance().addEnemy(this.node)
    }

    protected onDestroy() {
        EnemyStoreManager.getInstance().removeEnemy(this.node)
    }

    start() {

    }

    update(deltaTime: number) {

    }

    public initAttackAttr(attackAttr: AttackAttr) {
        this.attackAttr = attackAttr
    }

    // 被攻击时调用（由攻击方触发，如玩家子弹碰撞）
    public takeDamage(attackerAttr: AttackAttr) {
        // 计算伤害
        const { totalDamage, isCrit } = DamageCalculator.calculateFinalDamage(attackerAttr, this.defenseAttr)

        // 应用伤害（扣除生命值等）
        this.reduceHealth(totalDamage, isCrit)
    }

    async reduceHealth(damage: number, isCrit: boolean) {
        // 实现扣血逻辑（如怪物生命值 = 生命值 - damage）
        this.HP = this.HP - damage
        if (this.HP <= 0) {
            const rigidBody = this.getComponent(RigidBody2D)
            if (rigidBody) {
                rigidBody.enabled = false
            }
            this.createExpNode()
        } else {
            this.setPop(damage, isCrit)
        }
    }

    setPop(damage: number, isCrit: boolean) {
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Pop/pop", Prefab).then((Prefab) => {
            const popNode = instantiate(Prefab)
            // 是否暴击
            if (isCrit) {
                const labelNode = popNode.getChildByName("Label")
                const label = labelNode.getComponent(Label)
                label.enableOutline = true
            }
            this.node.addChild(popNode)
            const popScript = popNode.getComponent(Pop)
            popScript.setValue(damage)
            popNode.setWorldPosition(this.node.worldPosition)

            setTimeout(() => {
                popNode.destroy()
            }, 2000)

        })
    }

    async createExpNode() {
        const expPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Effects/BoomPink", Prefab)
        const expNode = instantiate(expPrefab)
        if (this.node.parent) {
            this.node.parent.addChild(expNode)
            expNode.setWorldPosition(this.node.getWorldPosition())
        }

        this.scheduleOnce(() => {
            this.node.destroy()
        }, 1)
    }
}