import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc'
import { ARMSTYPE, OWNERTYPE, PHY_GRPUP } from '../../Constant/Enum'
import { PlayerManager } from '../GameManager/PlayerManager'
import { EnemyManager } from '../GameManager/EnemyManager'
import { AttackAttr } from '../Attack/AttackAttr'
const { ccclass, property } = _decorator

@ccclass('Arms')
export class Arms extends Component {

    // 武器拥有者
    public ownerType: OWNERTYPE = null
    // 武器类型
    public armsType: ARMSTYPE = null
    // 武器伤害参数
    public attackAttr: AttackAttr = new AttackAttr()

    protected onLoad() {
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
        if (this.ownerType === OWNERTYPE.ENEMY && otherCollider.group === PHY_GRPUP.PLAYER) {
            this.scheduleOnce(() => {
                // console.log(`玩家受到伤害`)
                const playerManager = otherCollider.node.getComponent(PlayerManager)
                playerManager.takeDamage(this.attackAttr)
                this.destroyArm()
            }, 0)
        }

        if (this.ownerType === OWNERTYPE.PLAYER && otherCollider.group === PHY_GRPUP.ENEMY) {
            this.scheduleOnce(() => {
                // console.log(`怪物受到伤害`)
                const enemyManager = otherCollider.node.getComponent(EnemyManager)
                enemyManager.takeDamage(this.attackAttr)
                this.destroyArm()
            }, 0)
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
    }

    destroyArm() {
        if (this.armsType === ARMSTYPE.MAGIC || this.armsType === ARMSTYPE.RANGED) {
            if (this.node.isValid) {
                this.node.destroy()
            }
        }
    }
}

