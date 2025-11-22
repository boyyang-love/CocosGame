import { _decorator, Component, instantiate, math, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc'
import { ARMSTYPE, OWNERTYPE } from '../../Constant/Enum'
import { AttackAttr } from './AttackAttr'
import { Arms } from '../Arms/Arms'
const { ccclass, property } = _decorator

@ccclass('AutoAttack')
export class AutoAttack extends Component {
    @property(Node)
    public attackTargetNode: Node = null
    @property({ tooltip: "武器预制体", type: Prefab })
    public armsPrefab: Prefab = null

    public attackRange: number = 100 // 攻击范围
    public attackSpeed: number = 200 // 攻击速度
    public attackAngle: number = 90 // 多武器攻击夹角
    public attackSpace: number = 2 // 攻击时间间隔
    public bulletSpace: number = 0.5 // 多武器每一枚 发射间隔
    public armsCount: number = 2 // 武器数量
    public armsType: ARMSTYPE = ARMSTYPE.MELEE // 武器类型
    public armsOwner: OWNERTYPE = OWNERTYPE.PLAYER // 武器拥有者
    public armsLifeTime: number = 3  // 武器寿命（远程攻击武器）
    public attackAttr: AttackAttr = new AttackAttr() // 攻击参数

    private angles: number[] = [] // 每个元素的初始角度（避免重叠）
    private armsItems: Node[] = [] // 武器实例
    private armsNode: Node[] = []

    start() {
        if (this.armsType === ARMSTYPE.MELEE) {
            this.initArms()
        }

        if (this.armsType === ARMSTYPE.RANGED) {
            this.schedule(this.attack, this.attackSpace)
        }
    }

    protected onDestroy() {
        this.armsNode.forEach(node => {
            this.node.parent.removeChild(node)
        })
    }

    update(deltaTime: number) {
        if (this.armsType === ARMSTYPE.MELEE) {
            this.angles = this.angles.map(angle => {
                return (angle + this.attackSpeed * deltaTime) % 360
            })
            this.armsItems.forEach((item, index) => {
                const playerNodePos = this.node.worldPosition
                const angle = this.angles[index] * Math.PI / 180 // 角度转弧度
                const x = this.attackRange * Math.cos(angle)
                const y = this.attackRange * Math.sin(angle)
                item.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))
            })
        }
    }

    initArms() {
        if (this.armsType === ARMSTYPE.MELEE) {
            Array.from({ length: this.armsCount }).forEach((_, index) => {
                this.angles.push(index * this.getStep())
            })

            for (let i = 0; i < this.armsCount; i++) {
                const armsNode = instantiate(this.armsPrefab)
                this.node.addChild(armsNode)
                const armsScript = armsNode.getComponent(Arms)
                if (armsScript) {
                    // 分配武器归属以及攻击参数
                    armsScript.ownerType = this.armsOwner
                    armsScript.attackAttr = this.attackAttr
                    armsScript.armsType = this.armsType
                }
                const angle = this.angles[i] * Math.PI / 180 // 角度转弧度
                const playerNodePos = this.node.worldPosition
                // 三角函数计算坐标（x = r*cosθ, y = r*sinθ）
                const x = this.attackRange * Math.cos(angle)
                const y = this.attackRange * Math.sin(angle)
                armsNode.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))
                this.armsItems.push(armsNode)
            }
        }
    }

    attack() {
        const armsPos = this.node.worldPosition.toVec2()
        const targetPos = this.attackTargetNode.worldPosition.toVec2()
        const direction = new Vec2()
        Vec2.subtract(direction, targetPos, armsPos)
        if (direction.length() > this.attackRange) {
            return
        }

        const offsetAngle = this.attackAngle / this.armsCount
        const dirs: Vec2[] = []
        for (let i = 0; i < this.armsCount; i++) {
            const dir = this.getOffsetVector(armsPos, targetPos, i % 2 === 0 ? i * offsetAngle : - i * offsetAngle)
            if (dir.length() > 0) {
                dirs.push(dir)
            }
        }

        dirs.forEach(dir => {
            this.scheduleOnce(() => {
                this.spawnBullet(dir)
            }, this.bulletSpace)
        })
    }

    getStep(angle?: number): number {
        if (angle) {
            return angle / this.armsCount
        }
        // 近战武器
        if (this.armsType === ARMSTYPE.MELEE) {
            // 初始化每个元素的初始角度（平均分配）
            return 360 / this.armsCount
        }

        // 远程武器
        if (this.armsType === ARMSTYPE.RANGED) {
            return 90 / this.armsCount
        }
    }

    // 实例化子弹并设置方向
    spawnBullet(direction: Vec2) {
        if (!this.attackTargetNode) {
            return
        }

        const armsNode = instantiate(this.armsPrefab)
        this.node.parent.addChild(armsNode)
        armsNode.setWorldPosition(this.node.getWorldPosition()) // 从发射点出发

        const armsScript = armsNode.getComponent(Arms)
        if (armsScript) {
            // 分配武器归属以及攻击参数
            armsScript.ownerType = this.armsOwner
            armsScript.attackAttr = this.attackAttr
            armsScript.armsType = this.armsType
        }

        const rigidBody = armsNode.getComponent(RigidBody2D)
        if (rigidBody) {
            // 设置刚体速度（沿方向飞行）
            rigidBody.linearVelocity = direction.multiplyScalar(this.attackSpeed)
        }

        this.armsNode.push(armsNode)

        // 子弹自动销毁（避免内存泄漏）
        this.scheduleOnce(() => {
            if (armsNode.isValid) {
                armsNode.destroy()
            }
        }, this.armsLifeTime)
    }

    /**
     * 计算从起点到目标点的方向上，偏移指定角度（度）的向量
     * @param startPos 起点
     * @param targetPos 目标点
     * @param offsetAngle 偏移角度（度，正数=逆时针，负数=顺时针）
     * @returns 偏移后的单位向量
     */
    getOffsetVector(startPos: Vec2, targetPos: Vec2, offsetAngle: number): Vec2 {

        const originalDir = new Vec2()
        Vec2.subtract(originalDir, targetPos, startPos)
        // 位置重合特殊处理
        if (originalDir.lengthSqr() < 0.0001) {
            return new Vec2(0, 1).normalize()
        }
        // 1. 计算起点到目标点的原始方向向量（并归一化）
        originalDir.normalize()

        // 2. 将偏移角度转换为弧度（Cocos 数学函数使用弧度）
        const rad = math.toRadian(offsetAngle)

        // 3. 应用旋转公式计算偏移后的向量
        const x = originalDir.x * Math.cos(rad) - originalDir.y * Math.sin(rad)
        const y = originalDir.x * Math.sin(rad) + originalDir.y * Math.cos(rad)

        // 4. 归一化并返回（确保方向正确，长度为 1）
        return new Vec2(x, y).normalize()
    }
}

