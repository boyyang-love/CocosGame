import { ARMSTYPE, ATTACKMETHOD, OWNERTYPE } from "../Scripts/Constant/Enum"
import { AttackAttr } from "../Scripts/Game/Attack/AttackAttr"
export namespace Config {
    // 影响类型
    export enum effectType {
        HP = "HP",
        AttackAttr = "AttackAttr",
        DefenseAttr = "DefenseAttr",
        ARMSPROP = "armsProp",
        ARMSATTACKATTR = "armsAttackAttr"
    }
    // 玩家属性
    export interface PropertyConfig {
        id: number
        name: string
        desc: string
        icon: string
        rarity: string
        effectType: effectType
        effects: PropertyConfigEffects
    }

    export interface PropertyConfigEffects {
        baseDamage?: number
        attackPower?: number
        critRate?: number
        critDamage?: number
        damageBoost?: number
        extraDamage?: number
    }

    // 技能属性
    export interface SkillConfig {
        id: number
        name: string
        desc: string
        icon: string
        prefab: string
        effectPrefab: string
        sound: string
        attackMethod: ATTACKMETHOD
        armsOwner: OWNERTYPE
        armsType: ARMSTYPE
        armsProp: ArmsProp
        armsAttackAttr: Partial<AttackAttr>
    }

    export interface SkillPropertyConfig {
        id: number
        name: string
        desc: string
        icon: string
        effectType: effectType.ARMSPROP | effectType.ARMSATTACKATTR
        skillId: number
        effects: ArmsProp
    }

    export interface SkillPropertyConfigEffects {
        attackRange?: number
        attackSpeed?: number
        attackAngle?: number
        attackSpace?: number
        bulletSpace?: number
        armsCount?: number
        armsLifeTime?: number
    }

    export interface ArmsProp {
        attackRange: number
        attackSpeed: number
        attackAngle: number
        attackSpace: number
        bulletSpace: number
        armsCount: number
        armsLifeTime: number
    }
}

