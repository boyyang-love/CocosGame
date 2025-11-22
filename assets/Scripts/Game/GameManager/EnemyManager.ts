import { _decorator, Component, instantiate, Label, Node, Prefab } from 'cc'
import { DefenseAttr } from '../Attack/DefenseAttr'
import { AttackAttr } from '../Attack/AttackAttr'
import { DamageCalculator } from '../Attack/DamageCalculator'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Pop } from '../../Pop/Pop'
const { ccclass, property } = _decorator

@ccclass('EnemyManager')
export class EnemyManager extends Component {
    private HP: number = 1000
    private defenseAttr: DefenseAttr = new DefenseAttr()
    public attackAttr: AttackAttr = new AttackAttr()

    start() {

    }

    update(deltaTime: number) {

    }

    public initAttackAttr(attackAttr: AttackAttr){
        this.attackAttr = attackAttr
    }

    // 被攻击时调用（由攻击方触发，如玩家子弹碰撞）
    public takeDamage(attackerAttr: AttackAttr) {
        // 计算伤害
        const { damage, isCrit } = DamageCalculator.calculateFinalDamage(attackerAttr, this.defenseAttr)

        // 应用伤害（扣除生命值等）
        this.setPop(damage, isCrit)
        this.reduceHealth(damage)
    }

    private reduceHealth(damage: number) {
        // 实现扣血逻辑（如怪物生命值 = 生命值 - damage）
        this.HP-= damage
        if(this.HP <= 0) {
            this.node.destroy()
        }
    }

    private setPop(damage: number, isCrit: boolean){
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Pop/pop", Prefab).then((Prefab) => {
            const popPrefab = instantiate(Prefab)
            console.log(isCrit)
            // 是否暴击
            if(isCrit) {
                const labelNode = popPrefab.getChildByName("Label")
                const label = labelNode.getComponent(Label)
                label.enableOutline = true
            }
            this.node.addChild(popPrefab)
            const popScript = popPrefab.getComponent(Pop)
            popScript.setValue(damage)
            popPrefab.setWorldPosition(this.node.worldPosition)
            
        })
    }

}

