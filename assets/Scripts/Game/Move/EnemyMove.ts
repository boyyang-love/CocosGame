import { _decorator, Component, Node, RigidBody2D, Vec2, } from 'cc'
const { ccclass, property } = _decorator

@ccclass('EnemyMove')
export class EnemyMove extends Component {

    // 主角
    @property(Node)
    public targetNode: Node = null

    // 移动速度
    @property
    moveSpeed: number = 4

    // 追踪范围（超出范围不追踪）
    @property
    chaseRange: number = 2500

    // 攻击范围
    @property
    attackRange: number = 150

    // enemy 刚体
    private rigidBody: RigidBody2D = null

    // 追踪方向
    private moveDir: Vec2 = new Vec2()


    protected onLoad() {
        // 获取刚体组件
        let rigidBody = this.getComponent(RigidBody2D)
        this.rigidBody = rigidBody
    }

    start() {
    }

    update(deltaTime: number) {
        this.move()
    }

    move() {
        if (this.rigidBody && this.targetNode) {
            const targetPos = this.targetNode.worldPosition.toVec2()
            const enemyPos = this.node.worldPosition.toVec2()
            Vec2.subtract(this.moveDir, targetPos, enemyPos)

            // 超出范围停止追踪
            const distance = this.moveDir.length()
            if (distance > this.chaseRange || distance <= this.attackRange) {
                this.rigidBody.linearVelocity = Vec2.ZERO
                return
            }

            this.moveDir.normalize()
            const velocity = this.moveDir.multiplyScalar(this.moveSpeed)
            this.rigidBody.linearVelocity = velocity
        }
    }
}

