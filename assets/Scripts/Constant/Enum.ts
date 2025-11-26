
export enum PlayerStatus {
    energy,
    coin,
    health,
    star,
    power,
}

export enum ScenarioEffectReactType {
    add = "add",
    sub = "sub",
    mult = "mult",
    div = "div"
}

export enum MenuType {
    skill,
    gameGear,
    battle,
    shop
}

export enum EXPType {
    EXP,
    MaxEXP,
}

export enum HPTYPE {
    HP,
    HPMax,
}

export enum MPType {
    MP,
    MPMax,
}

export enum SkillType {
    ATK,
    DEF,
}

// 移动类型
export enum MoveType {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

// 碰撞矩阵
export enum PHY_GRPUP {
    DEFAULT = 1 << 0,
    OBOSTACLE = 1 << 1,
    ENEMY = 1 << 2,
    ARMS = 1 << 3,
    PLAYER = 1 << 4,
    EXP = 1 << 5,
}

// 武器拥有者
export enum OWNERTYPE {
    PLAYER,
    ENEMY
}

// 武器类型
export enum ARMSTYPE {
    MELEE = "MELEE",    // 近战武器
    RANGED = "RANGED",   // 远程武器
    MAGIC = "RANGED",     // 魔法武器
}

// 攻击方式
export enum ATTACKTYPE {

}

// 游戏音效
export enum GAMEAUDIO {
    bubbleAudio = "bubbleAudio"
}