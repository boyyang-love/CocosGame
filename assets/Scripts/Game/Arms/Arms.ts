import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, Prefab, RigidBody2D, Vec2 } from 'cc'
import { ARMSTYPE, OWNERTYPE, PHY_GRPUP } from '../../Constant/Enum'
import { PlayerManager } from '../GameManager/PlayerManager'
import { EnemyManager } from '../GameManager/EnemyManager'
import { AttackAttr } from '../Attack/AttackAttr'
import { Config } from 'db://assets/Types/Config'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
const { ccclass, property } = _decorator

@ccclass('Arms')
export class Arms extends Component {
    // 武器伤害参数
    public attackAttr: AttackAttr = new AttackAttr()
    // 技能配置
    public skillConfig: Config.SkillConfig

    protected start() {
        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
        }
    }

    protected onDestroy() {
        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this)
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (this.skillConfig.armsOwner === OWNERTYPE.ENEMY && otherCollider.group === PHY_GRPUP.PLAYER) {
            this.scheduleOnce(() => {
                // console.log(`玩家受到伤害`)
                const playerManager = otherCollider.node.getComponent(PlayerManager)
                if (playerManager) {
                    playerManager.takeDamage(this.attackAttr)
                    this.destroyArm(otherCollider)
                }
            }, 0)
        }

        if (this.skillConfig.armsOwner === OWNERTYPE.PLAYER && otherCollider.group === PHY_GRPUP.ENEMY) {
            this.scheduleOnce(() => {
                // console.log(`怪物受到伤害`)
                const enemyManager = otherCollider.node.getComponent(EnemyManager)
                if (enemyManager) {
                    enemyManager.takeDamage(this.attackAttr)
                    this.destroyArm(otherCollider)
                }
            }, 0)
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
    }

    async destroyArm(collider: Collider2D) {
        if (this.skillConfig.armsType === ARMSTYPE.RANGED) {
            try {
                const effectProfab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", this.skillConfig.effectPrefab, Prefab)
                const effectNode = instantiate(effectProfab)
                collider.node.addChild(effectNode)
                effectNode.setWorldPosition(collider.node.getWorldPosition())
                const rigidBody2D = this.node.getComponent(RigidBody2D)
                if (rigidBody2D) {
                    rigidBody2D.linearVelocity = Vec2.ZERO
                    this.node.active = false
                    setTimeout(() => {
                        if (collider.node) {
                            effectNode.destroy()
                        }
                        if(this.node){
                            this.node.destroy()
                        }
                    }, 1000)
                }
            } catch {
                this.destroy()
            }
        }
    }
}

