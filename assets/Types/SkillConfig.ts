
export namespace Skill {
    export interface SkillConfig {
        id: number
        name: string
        desc: string
        icon: string
        effectType: effectType
        effects: SkillConfigEffects
    }

    export interface SkillConfigEffects {
        baseDamage?: number
        attackPower?: number
        critRate?: number
        critDamage?: number
        damageBoost?: number
        extraDamage?: number
    }



    export enum effectType {
        HP = "HP",
        AttackAttr = "AttackAttr",
        DefenseAttr = "DefenseAttr",
    }
}

