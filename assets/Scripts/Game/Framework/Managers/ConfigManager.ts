import { Component, JsonAsset, resources } from "cc"
// Config.ts
// 技能配置管理器
export class ConfigManager {
    private static Instance: ConfigManager

    public static getInstance(): ConfigManager{
        if (!this.Instance) {
            this.Instance = new ConfigManager()
        }
        return this.Instance
    }

    // 加载配置表
    public loadConfig<T>(path: string):Promise<T[]> {
        return new Promise((resolve, reject) =>  {
            resources.load(path, (err, data: JsonAsset) => {
                if (!err) {
                    resolve(data.json as unknown as T[])
                }else{
                    reject(err)
                }
            })
        })
    }
}

