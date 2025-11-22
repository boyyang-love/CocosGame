import { _decorator, Component, Node, RigidBody2D, Vec2, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Exp')
export class Exp extends Component {
    // enemy 刚体
    private rigidBody: RigidBody2D = null

    // 追踪方向
    private moveDir: Vec2 = new Vec2()

    protected onLoad() {
        // 获取刚体组件
        let rigidBody = this.getComponent(RigidBody2D)
        this.rigidBody = rigidBody
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
}

