import { ARMSTYPE, ATTACKMETHOD, OWNERTYPE } from "../Scripts/Constant/Enum"

export namespace Config {
    export interface PropertyConfig {
        id: number
        name: string
        desc: string
        icon: string
        rarity: string
        effectType: effectType
        skillId?: number
        effects: PropertyConfigEffects | SkillPropertyConfigEffects
    }

    export interface PropertyConfigEffects {
        baseDamage?: number
        attackPower?: number
        critRate?: number
        critDamage?: number
        damageBoost?: number
        extraDamage?: number
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

    export enum effectType {
        HP = "HP",
        SKILL = "SKILL",
        AttackAttr = "AttackAttr",
        DefenseAttr = "DefenseAttr",
    }

    export interface SkillConfig {
        id: number
        name: string
        desc: string
        icon: string
        prefab: string
        effectPrefab: string
        sound: string
        attackMethod: ATTACKMETHOD
        armsType: ARMSTYPE
        armsProp: ArmsProp
        armsOwner: OWNERTYPE
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

