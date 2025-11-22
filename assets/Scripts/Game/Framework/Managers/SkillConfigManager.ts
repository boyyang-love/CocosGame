import { Asset, assetManager, Component, JsonAsset, resources } from "cc"
// SkillConfig.ts
export interface SkillLevelData {
    damage: number       // 伤害
    cd: number           // 冷却时间（秒）
    mpCost: number       // 法力消耗
}

export interface SkillConfig {
    skillId: number
    name: string
    icon: string
    maxLevel: number
    levels: SkillLevelData[]
    castAnim: string
    effectPrefab: string
    sound: string
}

// 技能配置管理器
export class SkillConfigManager extends Component {
    public static Instance: SkillConfigManager = null
    private configMap: Map<number, SkillConfig> = new Map() // skillId -> 配置

    public Init() {
        if (SkillConfigManager.Instance === null) {
            SkillConfigManager.Instance = new SkillConfigManager()
        }else{
            SkillConfigManager.Instance = this
        }
    }

    // 加载配置表
    loadSkillConfig():Promise<SkillConfig[]> {
        return new Promise((resolve, reject) =>  {
            resources.load("Config/SkillsConfig", (err, data: JsonAsset) => {
                if (!err) {
                    (data.json as unknown as SkillConfig[]).forEach(skill => {
                        this.configMap.set(skill.skillId, skill)
                    })
                    resolve(data.json as unknown as SkillConfig[])
                }else{
                    reject(err)
                }
            })
        })
    }

    // 获取技能配置（指定等级）
    getSkillConfig(skillId: number, level: number = 1): SkillLevelData & SkillConfig {
        const baseConfig = this.configMap.get(skillId)
        if (!baseConfig) throw new Error(`技能 ${skillId} 配置不存在`)
        const levelConfig = baseConfig.levels[level - 1] || baseConfig.levels[0] // 默认为1级
        return { ...baseConfig, ...levelConfig }
    }
}

