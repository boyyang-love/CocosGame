import { _decorator, Component, instantiate, Node, Prefab, RigidBody2D, Vec2, Vec3 } from 'cc'
import { PlayerStateManager } from '../GameManager/PlayerStateManager'
import { Config } from 'db://assets/Types/Config'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { ARMSTYPE } from '../../Constant/Enum'
import { Arms } from '../Arms/Arms'
import { EnemyStoreManager } from '../GameManager/EnemyStoreManager'
const { ccclass } = _decorator

@ccclass('CastSkill')
export class CastSkill extends Component {

    private angles: number[] = [] // 每个元素的初始角度（避免重叠）
    private armsNode: Node[] = []
    private skillConfig: Config.SkillConfig

    start() {

    }

    update(deltaTime: number) {
        if (this.armsNode.length && this.skillConfig && this.skillConfig.armsType === ARMSTYPE.MELEE) {
            this.angles = this.angles.map(angle => {
                return (angle + this.skillConfig.armsProp.attackSpeed * deltaTime) % 360
            })
            this.armsNode.forEach((item, index) => {
                const playerNodePos = this.node.worldPosition
                const angle = this.angles[index] * Math.PI / 180 // 角度转弧度
                const x = this.skillConfig.armsProp.attackRange * Math.cos(angle)
                const y = this.skillConfig.armsProp.attackRange * Math.sin(angle)
                item.angle = this.angles[index] + this.skillConfig.armsProp.attackSpeed * deltaTime
                item.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))
            })
        }
    }

    public castSkill(id: number) {
        const info = this.getSkillInfo(id)
        this.skillConfig = info
        console.log(info)
        if (info) {
            if (info.armsType === ARMSTYPE.MELEE) {
                this.MELEE_Attack(info)
            }

            if (info.armsType === ARMSTYPE.RANGED) {
                this.RANGED_Attack(info)
            }
        }
    }

    public getSkillInfo(id: number): Config.SkillConfig {
        const skillInfo = PlayerStateManager.Instance.skill.filter(s => s.id === id)
        if (skillInfo.length) {
            return skillInfo[0]
        } else {
            return null
        }
    }

    public async loadPrefab(path: string): Promise<Prefab> {
        const prefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", path, Prefab)
        if (prefab) {
            return prefab
        }

        return null
    }

    public async MELEE_Attack(info: Config.SkillConfig) {

        const armsPrefab = await this.loadPrefab(info.prefab)

        for (let i = 0; i < info.armsProp.armsCount; i++) {
            this.angles.push(i * 360 / info.armsProp.armsCount)
            const armsNode = instantiate(armsPrefab)
            this.node.addChild(armsNode)
            const armsScript = armsNode.getComponent(Arms)
            if (armsScript) {
                // 分配武器归属以及攻击参数
                armsScript.skillConfig = info
                armsScript.attackAttr = PlayerStateManager.Instance.attackAttr
            }
            const angle = this.angles[i] * Math.PI / 180 // 角度转弧度
            const playerNodePos = this.node.worldPosition
            // 三角函数计算坐标（x = r*cosθ, y = r*sinθ）
            const x = info.armsProp.attackRange * Math.cos(angle)
            const y = info.armsProp.attackRange * Math.sin(angle)
            armsNode.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))

            const armsInitAngle = 360 / info.armsProp.armsCount

            armsNode.angle = armsNode.angle + i * armsInitAngle

            this.armsNode.push(armsNode)
        }

        this.scheduleOnce(() => {
            this.armsNode.forEach(node => {
                this.node.removeChild(node)
            })
            this.armsNode = []
            this.angles = []
        }, info.armsProp.armsLifeTime)
    }

    public async RANGED_Attack(info: Config.SkillConfig) {
        const selfPos = this.node.getWorldPosition().toVec2()
        const enemyNode = EnemyStoreManager.getInstance().findEnemiesInRange(selfPos, info.armsProp.attackRange)
        const directions = enemyNode.map(e => {
            const direction = new Vec2()
            return Vec2.subtract(direction, e.node.worldPosition.toVec2(), selfPos).normalize()
        })

        for (let i = 0; i < info.armsProp.armsCount; i++) {
            if (directions[i]) {
                this.scheduleOnce(() => {
                    this.spawnBullet(directions[i], info)
                }, info.armsProp.bulletSpace * i)
            }
        }
    }

    // 实例化子弹并设置方向
    async spawnBullet(direction: Vec2, info: Config.SkillConfig) {
        const armsPrefab = await this.loadPrefab(info.prefab)
        const armsNode = instantiate(armsPrefab)
        this.node.parent.addChild(armsNode)
        armsNode.setWorldPosition(this.node.getWorldPosition()) // 从发射点出发

        const armsScript = armsNode.getComponent(Arms)
        if (armsScript) {
            // 分配武器归属以及攻击参数
            armsScript.attackAttr = PlayerStateManager.Instance.attackAttr
            armsScript.skillConfig = info
        }

        const rigidBody = armsNode.getComponent(RigidBody2D)
        if (rigidBody) {
            // 设置刚体速度（沿方向飞行）
            rigidBody.linearVelocity = direction.multiplyScalar(this.skillConfig.armsProp.attackSpeed)
        }

        // 子弹自动销毁（避免内存泄漏）
        this.scheduleOnce(() => {
            if (armsNode.isValid) {
                armsNode.destroy()
            }
        }, this.skillConfig.armsProp.armsLifeTime)
    }
}

