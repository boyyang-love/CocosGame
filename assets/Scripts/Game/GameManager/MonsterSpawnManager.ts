import { _decorator, Component, Node, Prefab, instantiate, Vec2, Vec3, PhysicsSystem2D, Rect, math } from 'cc'
const { ccclass, property } = _decorator

@ccclass('MonsterSpawnManager')
export class MonsterSpawnManager extends Component {
    @property({ type: Prefab })
    public monsterPrefab: Prefab = null; // 怪物预制体

    @property({ type: Number, tooltip: "总怪物数量" })
    public totalMonsterCount = 1000; // 目标生成数量

    @property({ type: Number, tooltip: "每批生成数量" })
    public spawnPerBatch = 50; // 每批生成 50 个（避免卡顿）

    @property({ type: Number, tooltip: "批次间隔（秒）" })
    public batchInterval = 0.1; // 每批生成间隔（0.1秒）

    @property({ type: Node, tooltip: "生成区域（空节点，缩放匹配地图范围）" })
    public spawnArea: Node = null; // 生成区域节点

    @property({ type: Number, tooltip: "怪物碰撞半径（用于防重叠）" })
    public monsterRadius = 20; // 怪物碰撞半径（需与预制体碰撞体一致）

    private spawnedCount = 0; // 已生成数量
    private spawnAreaMin: Vec2 = new Vec2(); // 生成区域最小值
    private spawnAreaMax: Vec2 = new Vec2(); // 生成区域最大值

    onLoad() {
        // 计算生成区域的边界（基于 spawnArea 节点的世界坐标）
        this.calculateSpawnAreaBounds()
    }

    start() {
        // 开始分批次生成怪物
        this.schedule(this.spawnBatchMonsters, this.batchInterval)
    }

    // 计算生成区域的边界（min/max 坐标）
    private calculateSpawnAreaBounds() {
        if (!this.spawnArea) {
            // 若无生成区域节点，使用默认边界（可自定义）
            this.spawnAreaMin.set(-500, -300)
            this.spawnAreaMax.set(500, 300)
            return
        }

        // 获取生成区域节点的世界 AABB（轴对齐包围盒）
        const aabb = this.spawnArea.getComponent(Node).worldAABB
        this.spawnAreaMin.set(aabb.x, aabb.y)
        this.spawnAreaMax.set(aabb.x + aabb.width, aabb.y + aabb.height)
    }

    // 每批生成怪物
    private spawnBatchMonsters() {
        if (this.spawnedCount >= this.totalMonsterCount) {
            this.unschedule(this.spawnBatchMonsters) // 生成完毕，停止调度
            return
        }

        // 计算当前批次需要生成的数量（最后一批可能不足 spawnPerBatch）
        const currentBatchCount = Math.min(this.spawnPerBatch, this.totalMonsterCount - this.spawnedCount)

        for (let i = 0; i < currentBatchCount; i++) {
            // 生成随机位置（并确保不重叠）
            const spawnPos = this.getRandomValidPosition()
            if (spawnPos) {
                // 实例化怪物
                this.spawnMonster(spawnPos)
                this.spawnedCount++
            }
        }
    }

    // 获取随机且不重叠的位置
    private getRandomValidPosition(): Vec3 | null {
        const maxRetry = 10 // 最大重试次数（避免死循环）
        let retryCount = 0

        while (retryCount < maxRetry) {
            // 1. 在生成区域内随机生成一个位置
            const randomX = math.randomRange(this.spawnAreaMin.x, this.spawnAreaMax.x)
            const randomY = math.randomRange(this.spawnAreaMin.y, this.spawnAreaMax.y)
            const candidatePos = new Vec2(randomX, randomY)

            // 2. 检测该位置是否与已有怪物重叠
            if (this.isPositionValid(candidatePos)) {
                return new Vec3(randomX, randomY, 0) // 位置有效，返回
            }

            retryCount++
        }

        // 重试多次仍无有效位置（可能地图太满），返回 null
        console.warn("无可用生成位置，可能地图空间不足或怪物密度过高")
        return null
    }

    // 检测位置是否有效（不与已有怪物重叠）
    private isPositionValid(pos: Vec2): boolean {
        // 检测范围：以候选位置为中心，怪物半径的 2 倍（避免重叠）
        const detectRadius = this.monsterRadius * 2
        const detectRect = new Rect(
            pos.x - detectRadius / 2,
            pos.y - detectRadius / 2,
            detectRadius,
            detectRadius
        )

        // 检测范围内是否有其他怪物（通过碰撞体筛选）
        const results = PhysicsSystem2D.instance.testAABB(detectRect)
        for (const result of results) {
            // 假设怪物预制体挂载了 Monster 组件，用于标识
            if (result.collider.node.getComponent("Monster")) {
                return false // 检测到已有怪物，位置无效
            }
        }

        return true // 位置有效
    }

    // 实例化怪物
    private spawnMonster(pos: Vec3) {
        const monsterNode = instantiate(this.monsterPrefab)
        monsterNode.position = pos
        monsterNode.parent = this.node // 父节点设为管理器，方便管理

        // 可选：初始禁用碰撞体，生成完毕后统一激活（优化性能）
        // const collider = monsterNode.getComponent(Collider2D);
        // collider.enabled = false;
        // this.scheduleOnce(() => collider.enabled = true, 1);
    }
}