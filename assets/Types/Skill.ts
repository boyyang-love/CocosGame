


export namespace Skill {
    export enum SkillState {
        READY = "ready",       // 就绪（可释放）
        COOLDOWN = "cooldown", // 冷却中
        CASTING = "casting",   // 释放中
        DISABLED = "disabled"  // 禁用（如能量不足）
    }
}