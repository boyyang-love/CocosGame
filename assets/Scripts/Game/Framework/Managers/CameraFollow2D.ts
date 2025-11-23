import { _decorator, Component, Node, Camera, Vec3, math, renderer } from 'cc'
const { ccclass, property } = _decorator

const { scene } = renderer
const { CameraProjection } = scene


@ccclass('CameraFollow2D')
export class CameraFollow2D extends Component {
    @property({ tooltip: "跟随目标（主角节点）", type: Node })
    target: Node = null

    @property({ tooltip: "平滑跟随速度（5-8 最佳）" })
    followSpeed: number = 6

    @property({ tooltip: "镜头偏移（相对于主角）", type: Vec3 })
    offset: Vec3 = new Vec3(0, 0, 0); // 上方偏移 200 像素

    private camera: Camera = null

    protected onLoad() {
        // 获取相机组件并设置为 2D 正交模式
        this.camera = this.getComponent(Camera)
        if (this.camera) this.camera.projection = CameraProjection.ORTHO
    }

    protected lateUpdate(dt: number) {
        if (!this.target || !this.camera) return

        // 计算目标位置（主角位置 + 偏移）
        const targetPos = new Vec3(
            this.target.worldPosition.x + this.offset.x,
            this.target.worldPosition.y + this.offset.y,
            this.node.z // 固定 z 轴，避免层级问题
        )

        // 平滑插值跟随（避免抖动）
        const finalPos = Vec3.lerp(
            new Vec3(),
            this.node.worldPosition,
            targetPos,
            this.followSpeed * dt
        )

        this.node.setWorldPosition(finalPos)
    }
}