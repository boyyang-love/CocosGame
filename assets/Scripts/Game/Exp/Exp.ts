import { _decorator, AudioClip, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, Vec2, Vec3 } from 'cc'
import { PHY_GRPUP } from '../../Constant/Enum'
import { PlayerManager,  } from '../GameManager/PlayerManager'
import AudioPoolManager from '../Framework/Managers/AudioPoolManager'
const { ccclass, property } = _decorator

@ccclass('Exp')
export class Exp extends Component {
    @property(AudioClip)
    bubbleAudio: AudioClip = null

    // enemy 刚体
    private rigidBody: RigidBody2D = null

    protected start() {
        // 获取刚体组件
        let rigidBody = this.getComponent(RigidBody2D)
        this.rigidBody = rigidBody

        let collider = this.getComponent(Collider2D)
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

    update(deltaTime: number) {
        this.move()
    }

    move() {
        const playerPos = this.node.parent.getChildByName("Player").worldPosition.toVec2()
        const expPos = this.node.worldPosition.toVec2()
        const dir = new Vec2()
        Vec2.subtract(dir, playerPos, expPos)
        const rigidBody = this.node.getComponent(RigidBody2D)
        if (rigidBody) {
            if (dir.length() <= 100) {
                dir.normalize()
                // 设置刚体速度（沿方向飞行）
                rigidBody.linearVelocity = dir.multiplyScalar(2)
            } else {
                rigidBody.linearVelocity = Vec2.ZERO
            }
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (otherCollider.group === PHY_GRPUP.PLAYER) {
            this.scheduleOnce(() => {
                this.rigidBody.enabled = false
                const playerManagerScript = otherCollider.getComponent(PlayerManager)
                playerManagerScript.setExp(100)
                this.schedule(() => {
                    this.node.destroy()
                }, 2)
            })
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
    }
}

