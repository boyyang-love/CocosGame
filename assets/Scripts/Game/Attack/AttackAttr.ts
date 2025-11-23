// 攻击方属性（玩家/怪物的攻击相关数据）
export class AttackAttr {
    baseDamage: number = 100 // 基础伤害
    attackPower: number = 50 // 攻击力（可叠加到基础伤害）
    critRate: number = 0.1 // 暴击率（0~1）
    critDamage: number = 1.5 // 暴击倍率
    damageBoost: number = 0 // 伤害增幅（百分比，如 0.3 代表 +30%）
    extraDamage: number = 0 // 额外固定伤害


    /**
     * 构造函数：实例化时传参赋值（支持部分属性）
     * @param initAttr 初始化属性对象（可选，未传则用默认值）
     */
    constructor(initAttr?: Partial<AttackAttr>) {
        // 若传入初始化参数，则覆盖默认值
        if (initAttr) {
            Object.assign(this, initAttr)
        }
    }
}

