import { _decorator, Component, find, instantiate, math, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc'
import { ARMSTYPE, OWNERTYPE } from '../../Constant/Enum'
import { AttackAttr } from './AttackAttr'
import { Arms } from '../Arms/Arms'
import { Config } from 'db://assets/Types/Config'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { EnemyStoreManager, EnemyStoreMapInfo } from '../GameManager/EnemyStoreManager'
const { ccclass, property } = _decorator

@ccclass('AutoAttack')
export class AutoAttack extends Component {
    @property(Node)
    public attackTargetNode: Node = null

    public skillConfig: Config.SkillConfig
    public attackAttr: AttackAttr = new AttackAttr() // 攻击参数

    private angles: number[] = [] // 每个元素的初始角度（避免重叠）
    private armsItems: Node[] = [] // 武器实例
    private armsNode: Node[] = []

    start() {
        // if (this.skillConfig.armsType === ARMSTYPE.MELEE) {
        //     this.initArms()
        // }

        // if (this.skillConfig.armsType === ARMSTYPE.RANGED) {
        //     this.schedule(this.attack, this.skillConfig.armsProp.attackSpace)
        // }

        // if(this.skillConfig.armsType === ARMSTYPE.MAGIC) {

        // }
    }

    protected onDestroy() {
        this.armsNode.forEach(node => {
            this.node.parent.removeChild(node)
        })
    }

    update(deltaTime: number) {
        if (this.skillConfig.armsType === ARMSTYPE.MELEE) {
            this.angles = this.angles.map(angle => {
                return (angle + this.skillConfig.armsProp.attackSpeed * deltaTime) % 360
            })
            this.armsItems.forEach((item, index) => {
                const playerNodePos = this.node.worldPosition
                const angle = this.angles[index] * Math.PI / 180 // 角度转弧度
                const x = this.skillConfig.armsProp.attackRange * Math.cos(angle)
                const y = this.skillConfig.armsProp.attackRange * Math.sin(angle)
                item.angle = this.angles[index] + this.skillConfig.armsProp.attackSpeed * deltaTime
                item.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))
            })
        }
    }

    async initArms() {
        if (this.skillConfig.armsType === ARMSTYPE.MELEE) {
            Array.from({ length: this.skillConfig.armsProp.armsCount }).forEach((_, index) => {
                this.angles.push(index * this.getStep())
            })

            for (let i = 0; i < this.skillConfig.armsProp.armsCount; i++) {
                const armsPrefab = await this.loadPrefab(this.skillConfig.prefab)
                const armsNode = instantiate(armsPrefab)
                this.node.addChild(armsNode)
                const armsScript = armsNode.getComponent(Arms)
                if (armsScript) {
                    // 分配武器归属以及攻击参数
                    armsScript.attackAttr = this.attackAttr
                    armsScript.skillConfig = this.skillConfig
                }
                const angle = this.angles[i] * Math.PI / 180 // 角度转弧度
                const playerNodePos = this.node.worldPosition
                // 三角函数计算坐标（x = r*cosθ, y = r*sinθ）
                const x = this.skillConfig.armsProp.attackRange * Math.cos(angle)
                const y = this.skillConfig.armsProp.attackRange * Math.sin(angle)
                armsNode.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))

                const armsInitAngle = 360 / this.skillConfig.armsProp.armsCount

                armsNode.angle = armsNode.angle + i * armsInitAngle

                this.armsItems.push(armsNode)
            }
        }
    }

    attack() {
        const armsPos = this.node.worldPosition.toVec2()
        if (!this.attackTargetNode) {
            const enemyNode = this.findEnemiesInRange()
            const directions = enemyNode.map(e => {
                const direction = new Vec2()
                return Vec2.subtract(direction, e.node.worldPosition.toVec2(), armsPos).normalize()
            })

            for (let i = 0; i < this.skillConfig.armsProp.armsCount; i++) {
                if (directions[i]) {
                    this.scheduleOnce(() => {
                        this.spawnBullet(directions[i])
                    }, this.skillConfig.armsProp.bulletSpace * i)
                }
            }

            return
        }
        const targetPos = this.attackTargetNode.worldPosition.toVec2()
        const direction = new Vec2()
        Vec2.subtract(direction, targetPos, armsPos)
        if (direction.length() > this.skillConfig.armsProp.attackRange) {
            return
        }

        const offsetAngle = this.skillConfig.armsProp.attackAngle / this.skillConfig.armsProp.armsCount
        const dirs: Vec2[] = []
        for (let i = 0; i < this.skillConfig.armsProp.armsCount; i++) {
            const dir = this.getOffsetVector(armsPos, targetPos, i % 2 === 0 ? i * offsetAngle : - i * offsetAngle)
            if (dir.length() > 0) {
                dirs.push(dir)
            }
        }

        dirs.forEach(dir => {
            this.scheduleOnce(() => {
                this.spawnBullet(dir)
            }, this.skillConfig.armsProp.bulletSpace)
        })
    }

    getStep(angle?: number): number {
        if (angle) {
            return angle / this.skillConfig.armsProp.armsCount
        }
        // 近战武器
        if (this.skillConfig.armsType === ARMSTYPE.MELEE) {
            // 初始化每个元素的初始角度（平均分配）
            return 360 / this.skillConfig.armsProp.armsCount
        }

        // 远程武器
        if (this.skillConfig.armsType === ARMSTYPE.RANGED) {
            return 90 / this.skillConfig.armsProp.armsCount
        }
    }

    // 实例化子弹并设置方向
    async spawnBullet(direction: Vec2) {

        const armsPrefab = await this.loadPrefab(this.skillConfig.prefab)
        const armsNode = instantiate(armsPrefab)
        this.node.parent.addChild(armsNode)
        armsNode.setWorldPosition(this.node.getWorldPosition()) // 从发射点出发

        const armsScript = armsNode.getComponent(Arms)
        if (armsScript) {
            // 分配武器归属以及攻击参数
            armsScript.attackAttr = this.attackAttr
            armsScript.skillConfig = this.skillConfig
        }

        const rigidBody = armsNode.getComponent(RigidBody2D)
        if (rigidBody) {
            // 设置刚体速度（沿方向飞行）
            rigidBody.linearVelocity = direction.multiplyScalar(this.skillConfig.armsProp.attackSpeed)
        }

        this.armsNode.push(armsNode)

        // 子弹自动销毁（避免内存泄漏）
        this.scheduleOnce(() => {
            if (armsNode.isValid) {
                armsNode.destroy()
            }
        }, this.skillConfig.armsProp.armsLifeTime)
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

    async loadPrefab(path: string): Promise<Prefab> {
        return await ResourceManager.Instance.AwaitGetAsset("Prefabs", path, Prefab)
    }

    private findEnemiesInRange(): EnemyStoreMapInfo[] {
        const playerPos = new Vec2(this.node.x, this.node.y) // 角色当前位置
        const allEnemies = EnemyStoreManager.getInstance().getAllEnemies()
        const nearbyEnemies: EnemyStoreMapInfo[] = []

        for (const enemy of allEnemies) {
            if (!enemy.node.active) continue // 跳过未激活的敌人

            // 计算角色与敌人的平面距离（2D 核心）
            const enemyPos = new Vec2(enemy.node.x, enemy.node.y)
            const distance = math.Vec2.distance(playerPos, enemyPos)

            // 筛选距离小于检测范围的敌人
            if (distance <= this.skillConfig.armsProp.attackRange) {
                nearbyEnemies.push(enemy)
            }
        }
        return nearbyEnemies
    }

}

