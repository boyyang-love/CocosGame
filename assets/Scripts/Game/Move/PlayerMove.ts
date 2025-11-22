import {
    _decorator,
    Component,
    EventKeyboard,
    Input,
    input,
    KeyCode,
    Vec2,
    animation,
    RigidBody2D
} from 'cc'

const { ccclass, property } = _decorator

@ccclass('PlayerMove')
export class PlayerMove extends Component {
    // 角色移动动画
    @property(animation.AnimationController)
    aniCtl: animation.AnimationController = null

    // 角色移动速度
    @property
    moveSpeed: number = 5
    private moveDir: Vec2 = new Vec2(0, 0)

    // 刚体
    private rigidBody: RigidBody2D = null

    protected onLoad() {
        // 监听键盘按下
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this)

        // 获取刚体组件
        let rigidBody = this.getComponent(RigidBody2D)
        this.rigidBody = rigidBody
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this)
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this)
    }

    start() {

    }

    update(deltaTime: number) {
        this.move(deltaTime)
    }

    onKeyDown(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W:
                this.moveDir.y = 1
                this.aniCtl.setValue("state", 2)
                break
            case KeyCode.KEY_S:
                this.moveDir.y = -1
                this.aniCtl.setValue("state", 1)
                break
            case KeyCode.KEY_A:
                this.moveDir.x = -1
                this.aniCtl.setValue("state", 4)
                break
            case KeyCode.KEY_D:
                this.moveDir.x = 1
                this.aniCtl.setValue("state", 3)
                break
        }
    }

    onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.KEY_S:
                this.moveDir.y = 0
                break
            case KeyCode.KEY_A:
            case KeyCode.KEY_D:
                this.moveDir.x = 0
                break
        }
    }

    move(dt: number) {
        this.moveDir.normalize()
        const velocity = this.moveDir.multiplyScalar(this.moveSpeed)
        this.rigidBody.linearVelocity = velocity
    }
}


