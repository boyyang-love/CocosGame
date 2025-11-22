// DamageCalculator.ts

import { AttackAttr } from "./AttackAttr"
import { DefenseAttr } from "./DefenseAttr"

export class DamageCalculator {
    /**
       * 计算最终伤害
       * @param attacker 攻击方属性
       * @param defender 防御方属性
       * @returns 最终伤害值（取整）
       */
    static calculateFinalDamage(attacker: AttackAttr, defender: DefenseAttr): { damage: number, isCrit: boolean } {
        // 1. 计算基础总伤害（基础伤害 + 攻击力加成 + 额外固定伤害）
        const totalBase = attacker.baseDamage + attacker.attackPower + attacker.extraDamage

        // 2. 计算伤害增幅（百分比加成）
        const boostedDamage = totalBase * (1 + attacker.damageBoost)

        // 3. 计算防御减伤（简化公式：减伤 = 防御力 / (防御力 + 100)，可自定义）
        const defenseReduction = defender.defense / (defender.defense + 100)
        // 叠加固定减伤率（如护盾、buff 减伤）
        const totalReduction = defenseReduction + defender.damageReduction
        // 确保减伤不超过 90%（避免减伤过高导致伤害为 0）
        const clampedReduction = Math.min(totalReduction, 0.9)
        const damageAfterDefense = boostedDamage * (1 - clampedReduction)

        // 4. 计算暴击（随机数 < 暴击率则触发暴击）
        const isCrit = Math.random() < attacker.critRate
        const finalDamage = Math.round(damageAfterDefense * (isCrit ? attacker.critDamage : 1))

        // 确保伤害不为负数
        return {
            damage: Math.max(finalDamage, 1), // 最低 1 点伤害
            isCrit: isCrit
        }
    }
}