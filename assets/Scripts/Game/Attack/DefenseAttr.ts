// 防御方属性（被攻击目标的防御相关数据）
export class DefenseAttr {
    basePhysicalDefense: number = 50
    baseMagicDefense: number = 40
    physicalDefenseBoost: number = 0.1 // 物理防御+10%
    magicDefenseBoost: number = 0.15  // 魔法防御+15%
    extraPhysicalDefense: number = 20 // 额外+20物理防御
    extraMagicDamage: number = 10 // 额外魔法防御
    physicalDamageReduction: number = 0.1 // 物理减伤10%
    magicDamageReduction: number = 0.05  // 魔法减伤5%

    constructor(initAttr?: Partial<DefenseAttr>) {

        // 覆盖传入的其他属性（新属性优先）
        if (initAttr) {
            Object.assign(this, initAttr)
        }
    }
}
