import { _decorator, Component, director, instantiate, Node, Prefab, RigidBody2D, Tween, tween, Vec2, Vec3 } from 'cc'
import { PlayerStateManager } from '../GameManager/PlayerStateManager'
import { Config } from 'db://assets/Types/Config'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { ARMSTYPE, ASSETPATH, OWNERTYPE } from '../../Constant/Enum'
import { Arms } from '../Arms/Arms'
import { EnemyStoreManager } from '../GameManager/EnemyStoreManager'
import { AttackAttr } from './AttackAttr'
import { EnemyManager } from '../GameManager/EnemyManager'
const { ccclass } = _decorator

export interface DirAndOffset {
    direction: Vec2,
    offset: number
    birthPos?: Vec3
}

@ccclass('CastSkill')
export class CastSkill extends Component {

    private angles: number[] = [] // 每个元素的初始角度（避免重叠）
    private armsNode: Node[] = [] // 武器节点
    private skillConfig: Config.SkillConfig // 技能信息

    start() {

    }

    update(deltaTime: number) {
        if (this.skillConfig && this.skillConfig.armsType === ARMSTYPE.MELEE) {
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

    public castSkill(info: Config.SkillConfig) {
        this.skillConfig = info
        if (info) {
            if (info.armsType === ARMSTYPE.MELEE) {
                this.MELEE_Attack(info)
            }

            if (info.armsType === ARMSTYPE.RANGED) {
                this.RANGED_Attack(info)
            }

            if (info.armsType === ARMSTYPE.MAGIC) {
                this.MAGIC_Attack(info)
            }

            if (info.armsType === ARMSTYPE.RITUAL) {
                this.RITUAL_Attack(info)
            }
        }
    }

    private async loadPrefab(path: string): Promise<Prefab> {
        const prefab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, path, Prefab)
        if (prefab) {
            return prefab
        }

        return null
    }

    private async MELEE_Attack(info: Config.SkillConfig) {

        const armsPrefab = await this.loadPrefab(info.prefab)

        for (let i = 0; i < info.armsProp.armsCount; i++) {
            this.angles.push(i * 360 / info.armsProp.armsCount)
            const armsNode = instantiate(armsPrefab)
            this.node.addChild(armsNode)
            const armsScript = armsNode.getComponent(Arms)
            if (armsScript) {
                // 分配武器归属以及攻击参数
                armsScript.skillConfig = info
                armsScript.attackAttr = this.getAttackAttr(info)
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
                node.destroy()
            })
            this.armsNode = []
            this.angles = []
        }, info.armsProp.armsLifeTime)
    }

    private async RANGED_Attack(info: Config.SkillConfig) {
        const selfPos = this.node.getWorldPosition().toVec2()
        const enemyNode = info.armsOwner === OWNERTYPE.PLAYER ? EnemyStoreManager.getInstance().findEnemiesInRange(selfPos, info.armsProp.attackRange) : [PlayerStateManager.Instance.PlayerNode]
        const dirAndOffset: DirAndOffset[] = enemyNode.map(e => {
            const direction = new Vec2()
            Vec2.subtract(direction, e.worldPosition.toVec2(), selfPos).normalize()
            const dirAndOffset = {
                direction: direction,
                offset: this.calculateHorizontalAngle(selfPos, e.getWorldPosition().toVec2())
            }
            return dirAndOffset
        })


        for (let i = 0; i < info.armsProp.armsCount; i++) {
            if (dirAndOffset[i]) {
                this.scheduleOnce(() => {
                    this.spawnBullet(dirAndOffset[i], info, this.node.getWorldPosition(),)
                }, info.armsProp.bulletSpace * i)
            }
        }
    }

    private async MAGIC_Attack(info: Config.SkillConfig) {
        const selfPos = this.node.getWorldPosition().toVec2()
        const enemyNode = info.armsOwner === OWNERTYPE.PLAYER ? EnemyStoreManager.getInstance().findEnemiesInRange(selfPos, info.armsProp.attackRange) : [PlayerStateManager.Instance.PlayerNode]
        const dirAndOffset: DirAndOffset[] = enemyNode.map(e => {
            const direction = new Vec2()
            const enemyPos = e.getWorldPosition().toVec2()
            Vec2.subtract(direction, enemyPos, new Vec2(enemyPos.x, enemyPos.y + 600),).normalize()
            return {
                direction: direction,
                offset: 0,
                birthPos: new Vec3(enemyPos.x, enemyPos.y + 600)
            }
        })

        for (let i = 0; i < info.armsProp.armsCount; i++) {
            if (dirAndOffset[i]) {
                this.scheduleOnce(() => {
                    this.spawnBullet(dirAndOffset[i], info, dirAndOffset[i].birthPos,)
                }, info.armsProp.bulletSpace * i)
            }
        }
    }

    private async RITUAL_Attack(info: Config.SkillConfig) {
        this.createRitual(info)
    }

    // 实例化子弹并设置方向
    private async spawnBullet(dirAndOffset: DirAndOffset, info: Config.SkillConfig, birthPos?: Vec3,) {
        const armsPrefab = await this.loadPrefab(info.prefab)
        const armsNode = instantiate(armsPrefab)
        this.node.parent.addChild(armsNode)
        armsNode.setWorldPosition(birthPos ? birthPos : this.node.getWorldPosition()) // 从发射点出发
        armsNode.angle = armsNode.angle + dirAndOffset.offset

        const armsScript = armsNode.getComponent(Arms)
        if (armsScript) {
            // 分配武器归属以及攻击参数
            armsScript.attackAttr = this.getAttackAttr(info)
            armsScript.skillConfig = info
        }

        const rigidBody = armsNode.getComponent(RigidBody2D)
        if (rigidBody) {
            // 设置刚体速度（沿方向飞行）
            rigidBody.linearVelocity = dirAndOffset.direction.multiplyScalar(this.skillConfig.armsProp.attackSpeed)
        }

        // 子弹自动销毁（避免内存泄漏）
        this.scheduleOnce(() => {
            armsNode.destroy()
        }, this.skillConfig.armsProp.armsLifeTime)
    }

    private async createRitual(info: Config.SkillConfig) {
        const armsPrefab = await this.loadPrefab(info.prefab)
        const armsNode = instantiate(armsPrefab)

        const armsScript = armsNode.getComponent(Arms)
        if (armsScript) {
            // 分配武器归属以及攻击参数
            armsScript.attackAttr = this.getAttackAttr(info)
            armsScript.skillConfig = info
        }
        this.node.parent.addChild(armsNode)
        armsNode.setWorldPosition(this.node.getWorldPosition())

        this.scheduleOnce(() => {
            armsNode.destroy()
        }, info.armsProp.armsLifeTime)
    }


    /**
     * 计算两点的水平夹角（与水平向右的夹角，0~360°）
     * @param fromPoint 起点（如玩家坐标）
     * @param toPoint 终点（如目标坐标）
     * @returns 水平夹角（角度，0°=右，90°=上，180°=左，270°=下）
     */
    calculateHorizontalAngle(fromPoint: Vec2, toPoint: Vec2): number {
        // 1. 计算偏移量
        const dx = toPoint.x - fromPoint.x
        const dy = toPoint.y - fromPoint.y

        // 2. 计算弧度（atan2(dy, dx)：dy在前，dx在后）
        const radian = Math.atan2(dy, dx)

        // 3. 弧度转角度
        let angle = radian * (180 / Math.PI)

        // 4. 归一化：将负角度转为 0~360°（可选，根据需求）
        if (angle < 0) {
            angle += 360
        }

        return angle
    }

    // 获取攻击属性
    private getAttackAttr(info: Config.SkillConfig): AttackAttr {
        if(info.armsOwner === OWNERTYPE.PLAYER){
            return PlayerStateManager.Instance.attackAttr
        }else{
            const enemyManagerScript = this.node.getComponent(EnemyManager)
            return enemyManagerScript.attackAttr
        }
    }

}

