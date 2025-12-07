import { _decorator, Component, Node } from 'cc'
import { ConfigManager } from '../Framework/Managers/ConfigManager'
import { Config } from 'db://assets/Types/Config'

export class SkillManager {
    private static Instance: SkillManager

    public propertyConfigs: Map<number, Config.PropertyConfig> = new Map()
    public propertyConfigsId: Set<number> = new Set()

    public skillConfigs: Map<number, Config.SkillConfig> = new Map()
    public skillConfigsId: Set<number> = new Set()

    public static getInstance(): SkillManager {
        if (!this.Instance) {
            this.Instance = new SkillManager()
        }

        return this.Instance
    }

    public loadConfigs() {
        ConfigManager.getInstance().loadConfig<Config.PropertyConfig>("Config/PropertyConfig").then(data => {
            data.forEach(d => {
                this.propertyConfigs.set(d.id, d)
                this.propertyConfigsId.add(d.id)
            })
        })

        ConfigManager.getInstance().loadConfig<Config.SkillConfig>("Config/SkillConfig").then(data => {
            data.forEach(d => {
                this.skillConfigs.set(d.id, d)
                this.skillConfigsId.add(d.id)
            })
        })
    }

    public getPropertyConfigInfoById(id: number): Config.PropertyConfig{
        return this.propertyConfigs.get(id)
    }

    public getSkillConfigInfoById(id: number): Config.SkillConfig {
        return this.skillConfigs.get(id)
    }
}

