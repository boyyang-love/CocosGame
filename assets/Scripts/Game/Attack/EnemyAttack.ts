import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, ParticleSystem2D, PhysicsSystem2D, Prefab, RigidBody2D, Vec2, Vec3, warn } from 'cc'
import { Arms } from '../Arms/Arms'
import { ARMSTYPE, ATTACKTYPE, OWNERTYPE } from '../../Constant/Enum'
import { AttackAttr } from './AttackAttr'
const { ccclass, property } = _decorator

@ccclass('EnemyAttack')
export class EnemyAttack extends Component {
    @property({ tooltip: "攻击范围", type: Number })
    public attackRange: number = 300

    @property({ tooltip: "发射间隔（秒）", type: Number })
    public attackInterval: number = 2

    @property({ tooltip: "子弹速度（像素/秒）", type: Number })
    public bulletSpeed: number = 20

    @property({ tooltip: "攻击武器预制体", type: Prefab })
    public attackArm: Prefab = null

    @property({ tooltip: "攻击目标", type: Node })
    public attackTarget: Node = null 

    @property({ tooltip: "子弹自动销毁时间（秒）", type: Number })
    public bulletLifeTime: number = 3 

    @property({tooltip: "攻击方式"})
    public attackType: ATTACKTYPE 

    // 武器伤害
    public armsAttackAttr: AttackAttr = new AttackAttr()

    protected onLoad() {
        // 启动攻击计时器（间隔 attackInterval 秒）
        this.schedule(this.attack, this.attackInterval)
    }

    attack() {
        // 检查目标是否存在
        if (!this.attackTarget) {
            console.warn("未设置攻击目标！")
            return
        }

        // 计算敌人与目标的位置和方向
        const enemyPos = this.node.worldPosition.toVec2()
        const targetPos = this.attackTarget.worldPosition.toVec2()
        const direction = new Vec2()
        Vec2.subtract(direction, targetPos, enemyPos)

        // 计算距离，判断是否在攻击范围内
        const distance = direction.length()
        if (distance > this.attackRange) {
            // 目标超出范围，不发射
            return
        }

        // 实例化子弹
        if (!this.attackArm) {
            console.warn("未设置攻击武器预制体！")
            return
        }
        const bullet = instantiate(this.attackArm)
        const arms = bullet.getComponent(Arms)
        // 将武器归属划分给敌人
        if (arms) {
            arms.ownerType = OWNERTYPE.ENEMY
            arms.armsType = ARMSTYPE.RANGED
            arms.attackAttr = this.armsAttackAttr
        } else {
            console.warn("未挂载Arms脚本")
        }

        bullet.parent = this.node.parent // 与敌人同层级
        bullet.setWorldPosition(new Vec3(enemyPos.x, enemyPos.y, 0)) // 从敌人位置发射

        // 设置子弹方向和速度
        direction.normalize() // 归一化方向
        const rigidBody = bullet.getComponent(RigidBody2D)
        if (rigidBody) {
            rigidBody.linearVelocity = direction.multiplyScalar(this.bulletSpeed)
        } else {
            console.warn("子弹预制体缺少RigidBody2D组件！")
        }

        // 子弹自动销毁（避免内存泄漏）
        this.scheduleOnce(() => {
            if (bullet.isValid) { // 检查节点是否仍有效
                bullet.destroy()
            }
        }, this.bulletLifeTime)
    }
}