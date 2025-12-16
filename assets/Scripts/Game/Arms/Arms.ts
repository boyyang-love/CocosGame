import { ASSETPATH } from './../../Constant/Enum'
import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Prefab, resources, RigidBody2D, Vec2 } from 'cc'
import { ARMSTYPE, OWNERTYPE, PHY_GRPUP } from '../../Constant/Enum'
import { PlayerManager } from '../GameManager/PlayerManager'
import { EnemyManager } from '../GameManager/EnemyManager'
import { AttackAttr } from '../Attack/AttackAttr'
import { Config } from 'db://assets/Types/Config'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { ArmsStoreManager } from '../GameManager/ArmsStoreManager'
import AudioPoolManager from '../Framework/Managers/AudioPoolManager'
const { ccclass, property } = _decorator

@ccclass('Arms')
export class Arms extends Component {
    // 武器伤害参数
    public attackAttr: AttackAttr = new AttackAttr()
    // 技能配置
    public skillConfig: Config.SkillConfig

    protected onLoad() {
        
    }

    protected start() {
        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this)
        }

        this.scheduleOnce(() => {
            this.node.destroy()
        }, this.skillConfig.armsProp.armsLifeTime)
    }

    protected onDestroy() {
        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this)
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (this.skillConfig.armsOwner === OWNERTYPE.ENEMY && otherCollider.group === PHY_GRPUP.PLAYER) {
            // console.log(`玩家受到伤害`)
            const playerManager = otherCollider.node.getComponent(PlayerManager)
            if (playerManager) {
                playerManager.takeDamage(this.attackAttr)
                this.playEffect(otherCollider)
            }
        }

        if (this.skillConfig.armsOwner === OWNERTYPE.PLAYER && otherCollider.group === PHY_GRPUP.ENEMY) {
            const enemyManager = otherCollider.node.getComponent(EnemyManager)
            if (enemyManager) {
                enemyManager.takeDamage(this.attackAttr)
                this.playEffect(otherCollider)
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
    }

    async playEffect(collider: Collider2D) {
        if (this.skillConfig.armsType !== ARMSTYPE.MELEE && this.skillConfig.armsType !== ARMSTYPE.RITUAL) {
            const rigidBody2D = this.node.getComponent(RigidBody2D)
            if (rigidBody2D) {
                rigidBody2D.linearVelocity = Vec2.ZERO
                rigidBody2D.enabled = false
                this.node.active = false
            }
        }

        if (this.skillConfig.sound) {
            AudioPoolManager.getInstance().playAudio(this.skillConfig.sound, 0.5)
        }

        if (this.skillConfig.effectPrefab) {
            const effectProfab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, this.skillConfig.effectPrefab, Prefab)
            const effectNode = instantiate(effectProfab)
            collider.node.addChild(effectNode)
            effectNode.setWorldPosition(collider.node.getWorldPosition())
            setTimeout(() => {
                if (collider.node) {
                    collider.node.removeChild(effectNode)
                }
            }, 1000)
        }
    }
}

