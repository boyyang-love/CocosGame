
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
    PLAYER = "PLAYER",
    ENEMY = "ENEMY"
}

// 武器类型
export enum ARMSTYPE {
    MELEE = "MELEE",    // 近战武器
    RANGED = "RANGED",   // 远程武器
    MAGIC = "MAGIC",     // 魔法武器
    RITUAL = "RITUAL", // 阵法
}

// 攻击方式
export enum ATTACKMETHOD {
    CIRCLE = "CIRCLE",
    SHOOT = "SHOOT",
    MAGIC = "MAGIC"
}

// 游戏音效
export enum GAMEAUDIO {
    bubbleAudio = "bubbleAudio"
}

// 事件监听
export enum CUSTOMEVENTNAME{
    SKILLCHANGE,
}

// 游戏状态
export enum GAMESTATUS {
    PAUSE,
    STOP,
    PLAY
}

export enum ASSETPATH {
    PREFAB = "Prefabs"
}

export enum AUDIOPATH {
    bubble = "Audio/bubble"
}

export enum SKILLPROPERTYEFFECT {
    ARMSPROP = "armsProp",
    ARMSATTACKATTR = "armsAttackAttr",
}
