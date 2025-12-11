import { _decorator, AudioClip, Camera, Component, instantiate, Label, Node, Prefab, EventTarget } from 'cc'
import { AttackAttr } from '../Attack/AttackAttr'
import { DefenseAttr } from '../Attack/DefenseAttr'
import { DamageCalculator } from '../Attack/DamageCalculator'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Pop } from '../../Pop/Pop'
import { PlayerStateManager } from './PlayerStateManager'
import { ASSETPATH, HPTYPE, OWNERTYPE } from '../../Constant/Enum'
import AudioPoolManager from '../Framework/Managers/AudioPoolManager'
import { CastSkill } from '../Attack/CastSkill'
import { SkillManager } from './SkillManager'
const { ccclass, property } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    public static Instance: PlayerManager = null

    @property(AudioClip)
    expAudioClip: AudioClip = null

    private skills: Map<number, CastSkill> = new Map()

    protected onLoad() {
        if (PlayerManager.Instance === null) {
            PlayerManager.Instance = this
        } else {
            this.destroy
        }
    }

    // 被攻击时调用（由攻击方触发，如玩家子弹碰撞）
    public takeDamage(attackerAttr: AttackAttr) {
        // 计算伤害
        const { totalDamage, isCrit } = DamageCalculator.calculateFinalDamage(attackerAttr, PlayerStateManager.Instance.defenseAttr)

        // 应用伤害（扣除生命值等）
        this.reduceHealth(totalDamage, isCrit)
    }

    private reduceHealth(damage: number, isCrit: boolean) {
        // 实现扣血逻辑（如怪物生命值 = 生命值 - damage）
        ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "Effects/BloodImpact", Prefab).then((prefab) => {
            const boomNode = instantiate(prefab)
            this.node.addChild(boomNode)
            boomNode.setWorldPosition(this.node.getWorldPosition())

            this.scheduleOnce(() => {
                if (boomNode.isValid) {
                    boomNode.destroy()
                }
            })
        })

        PlayerStateManager.Instance.setHp(-damage, HPTYPE.HP)

        this.setPop(damage, isCrit)
    }

    private setPop(damage: number, isCrit: boolean) {
        ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "Pop/pop", Prefab).then((Prefab) => {
            const popNode = instantiate(Prefab)
            // 是否暴击
            if (isCrit) {
                const labelNode = popNode.getChildByName("Label")
                const label = labelNode.getComponent(Label)
                label.enableOutline = true
            }
            this.node.addChild(popNode)
            const popScript = popNode.getComponent(Pop)
            popScript.setValue(damage)
            popNode.setWorldPosition(this.node.worldPosition)

            this.scheduleOnce(() => {
                popNode.destroy()
            }, 2)
        })
    }

    public setExp(exp: number) {
        PlayerStateManager.Instance.setEXP(exp)
        if (this.expAudioClip) {
            AudioPoolManager.getInstance().playAudio(this.expAudioClip, 1)
        }
    }

    public mountSkill(id: number) {
        const castSkillScript = this.node.addComponent(CastSkill)
        this.skills.set(id, castSkillScript)
        const skillInfo = SkillManager.getInstance().getSkillConfigInfoById(id)
        skillInfo.armsOwner = OWNERTYPE.PLAYER
        PlayerStateManager.Instance.setSkill({...skillInfo})
    }

    public unMountSkill(id: number) {
        const castSkillScript = this.skills.get(id)
        castSkillScript.destroy()
        this.skills.delete(id)
        PlayerStateManager.Instance.delSkill(id)
    }

    public castSkill(id: number) {
        const castSkillScript = this.skills.get(id)
        const info = PlayerStateManager.Instance.getSkillById(id)
        if (info) {
            castSkillScript.castSkill(info)
        }
    }
}

