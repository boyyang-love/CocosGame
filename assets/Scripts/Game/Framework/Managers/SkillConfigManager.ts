import { Skill } from './../../../../Types/SkillConfig';
import { Asset, assetManager, Component, JsonAsset, resources } from "cc"
// SkillConfig.ts
// 技能配置管理器
export class SkillConfigManager extends Component {
    public static Instance: SkillConfigManager = null
    private configMap = new Map<number, Skill.SkillConfig>() // skillId -> 配置
    public skillId = new Set<number>()

    public Init() {
        if (SkillConfigManager.Instance === null) {
            SkillConfigManager.Instance = this
        }else{
            SkillConfigManager.Instance = this
        }
    }

    // 加载配置表
    loadSkillConfig():Promise<Skill.SkillConfig[]> {
        return new Promise((resolve, reject) =>  {
            resources.load("Config/SkillsConfig", (err, data: JsonAsset) => {
                if (!err) {
                    (data.json as unknown as Skill.SkillConfig[]).forEach(skill => {
                        this.configMap.set(skill.id, skill)
                        this.skillId.add(skill.id)
                    })
                    resolve(data.json as unknown as Skill.SkillConfig[])
                }else{
                    reject(err)
                }
            })
        })
    }

    // 获取技能配置（指定等级）
    getSkillConfig(skillId: number): Skill.SkillConfig {
        const baseConfig = this.configMap.get(skillId)
        if (!baseConfig) throw new Error(`技能 ${skillId} 配置不存在`)
        return { ...baseConfig }
    }
}

