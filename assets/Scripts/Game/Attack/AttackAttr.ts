export class AttackAttr {
    // 基础属性（保留原有，新增伤害类型拆分）
    basePhysicalDamage: number = 100 // 基础物理伤害
    baseMagicDamage: number = 50   // 基础魔法伤害

    physicalAttackPower: number = 50 // 物理攻击力（叠加到物理伤害）
    magicAttackPower: number = 30    // 魔法攻击力（叠加到魔法伤害）

    critRate: number = 0.1           // 暴击率（0~1，对两种伤害均生效）
    critDamage: number = 1.5        // 暴击倍率（对两种伤害均生效）

    physicalDamageBoost: number = 0  // 物理伤害增幅（百分比，如 0.3 = +30%）
    magicDamageBoost: number = 0     // 魔法伤害增幅（百分比，如 0.3 = +30%）

    extraPhysicalDamage: number = 0  // 额外固定物理伤害
    extraMagicDamage: number = 0     // 额外固定魔法伤害

    /**
     * 构造函数：实例化时传参赋值（支持部分属性，兼容旧用法）
     * @param initAttr 初始化属性对象（可选，未传则用默认值）
     */
    constructor(initAttr?: Partial<AttackAttr>) {

        // 覆盖传入的其他属性（新属性优先）
        if (initAttr) {
            Object.assign(this, initAttr)
        }
    }
}