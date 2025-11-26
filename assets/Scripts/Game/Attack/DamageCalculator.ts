import { AttackAttr } from "./AttackAttr"
import { DefenseAttr } from "./DefenseAttr"

// 伤害结算结果类型（包含详细拆分，方便外部使用）
export interface DamageResult {
    physicalDamage: number // 最终物理伤害
    magicDamage: number    // 最终魔法伤害
    totalDamage: number    // 总伤害（物理+魔法）
    isCrit: boolean        // 是否触发暴击（一次攻击仅判断一次暴击）
    rawPhysicalDamage: number // 未减免的原始物理伤害
    rawMagicDamage: number    // 未减免的原始魔法伤害
}

/**
 * 伤害计算器：基于 AttackAttr 和 DefenseAttr 计算最终伤害
 */
export class DamageCalculator {
    /**
     * 计算攻击方对防御方的最终伤害
     * @param attackerAttr 攻击方属性
     * @param defenderAttr 防御方属性
     * @returns 完整伤害结果
     */
    public static calculateFinalDamage(
        attackerAttr: AttackAttr,
        defenderAttr: DefenseAttr
    ): DamageResult {
        // 1. 暴击判定（一次攻击仅判断一次，对两种伤害均生效）
        const isCrit = Math.random() <= attackerAttr.critRate
        const critMultiplier = isCrit ? attackerAttr.critDamage : 1

        // 2. 计算原始物理伤害（未考虑防御）
        const rawPhysical = this.calculateRawPhysicalDamage(attackerAttr, critMultiplier)

        // 3. 计算原始魔法伤害（未考虑防御）
        const rawMagic = this.calculateRawMagicDamage(attackerAttr, critMultiplier)

        // 4. 计算防御减免后的最终物理伤害
        const finalPhysical = this.calculateDefensedPhysicalDamage(rawPhysical, defenderAttr)

        // 5. 计算防御减免后的最终魔法伤害
        const finalMagic = this.calculateDefensedMagicDamage(rawMagic, defenderAttr)

        // 6. 计算总伤害
        const totalDamage = finalPhysical + finalMagic

        return {
            physicalDamage: finalPhysical,
            magicDamage: finalMagic,
            totalDamage,
            isCrit,
            rawPhysicalDamage: rawPhysical,
            rawMagicDamage: rawMagic,
        }
    }

    /**
     * 计算未考虑防御的原始物理伤害
     * @param attackerAttr 攻击方属性
     * @param critMultiplier 暴击倍率（1 或 critDamage）
     * @returns 原始物理伤害
     */
    private static calculateRawPhysicalDamage(
        attackerAttr: AttackAttr,
        critMultiplier: number
    ): number {
        // 基础叠加 = 基础物理伤害 + 物理攻击力 + 额外固定物理伤害
        const base = attackerAttr.basePhysicalDamage + attackerAttr.physicalAttackPower + attackerAttr.extraPhysicalDamage
        // 增幅后伤害 = 基础 × (1 + 物理伤害增幅)
        const boosted = base * (1 + attackerAttr.physicalDamageBoost)
        // 暴击后原始伤害（向下取整）
        return Math.floor(boosted * critMultiplier)
    }

    /**
     * 计算未考虑防御的原始魔法伤害
     * @param attackerAttr 攻击方属性
     * @param critMultiplier 暴击倍率（1 或 critDamage）
     * @returns 原始魔法伤害
     */
    private static calculateRawMagicDamage(
        attackerAttr: AttackAttr,
        critMultiplier: number
    ): number {
        const base = attackerAttr.baseMagicDamage + attackerAttr.magicAttackPower + attackerAttr.extraMagicDamage
        const boosted = base * (1 + attackerAttr.magicDamageBoost)
        return Math.floor(boosted * critMultiplier)
    }

    /**
     * 计算防御减免后的最终物理伤害
     * @param rawPhysical 原始物理伤害
     * @param defenderAttr 防御方属性
     * @returns 最终物理伤害（≥0）
     */
    private static calculateDefensedPhysicalDamage(
        rawPhysical: number,
        defenderAttr: DefenseAttr
    ): number {
        // 最终防御值 = (基础物理防御 + 额外物理防御) × (1 + 物理防御增幅)
        const finalPhysicalDefense = Math.floor(
            (defenderAttr.basePhysicalDefense + defenderAttr.extraPhysicalDefense) * (1 + defenderAttr.physicalDefenseBoost)
        )

        // 伤害减免 = 原始伤害 × (1 - 物理减伤比例) - 最终防御值
        const defensed = Math.floor(rawPhysical * (1 - defenderAttr.physicalDamageReduction)) - finalPhysicalDefense

        // 伤害下限为 0
        return Math.max(defensed, 0)
    }

    /**
     * 计算防御减免后的最终魔法伤害
     * @param rawMagic 原始魔法伤害
     * @param defenderAttr 防御方属性
     * @returns 最终魔法伤害（≥0）
     */
    private static calculateDefensedMagicDamage(
        rawMagic: number,
        defenderAttr: DefenseAttr
    ): number {
        const finalMagicDefense = Math.floor(
            (defenderAttr.baseMagicDefense + defenderAttr.extraMagicDamage) * (1 + defenderAttr.magicDefenseBoost)
        )

        const defensed = Math.floor(rawMagic * (1 - defenderAttr.magicDamageReduction)) - finalMagicDefense

        return Math.max(defensed, 0)
    }
}