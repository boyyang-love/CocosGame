import { _decorator, Component, EffectAsset, JsonAsset, Node, resources } from 'cc'
import { ScenarioEffectReactType } from '../../../Constant/Enum'
const { ccclass, property } = _decorator

export interface ScenarioEffectReact {
    type: ScenarioEffectReactType,
    value: number
}

export interface ScenarioEffect {
    HP: ScenarioEffectReact
    MP: ScenarioEffectReact
    ATK: ScenarioEffectReact
    DEF: ScenarioEffectReact
}

export interface Scenario {
    id: string
    type: string
    icon: string
    descript: string
    effect: ScenarioEffect
}

export interface EffectBase {
    HP: number
    MP: number
    ATK: number
    DEF: number
}

export class ScenarioManager {
    public static Instance: ScenarioManager = null

    private scenarioMap: Map<string, Scenario> = new Map()
    public Init() {
        if (ScenarioManager.Instance === null) {
            ScenarioManager.Instance = new ScenarioManager()
        }
    }

    public loadScenario() {
        return new Promise((resolve, reject) => {
            resources.load("Scenario/Chapter001", (err, data: JsonAsset) => {
                if (!err) {
                    (data.json as unknown as Scenario[]).forEach(s => {
                        this.scenarioMap.set(s.id, s)
                    })
                    resolve(data.json as unknown as Scenario[])
                } else {
                    reject(err)
                }
            })
        })
    }

    public getScenario(id: string){
        return this.scenarioMap.get(id)
    }

    public getScenarioRandom(){
        const keys = [...this.scenarioMap.keys()]
        const randomIndex = Math.floor(Math.random() * keys.length)
        const randomId = keys[randomIndex]
        return this.scenarioMap.get(randomId)
    }

    // 计算玩家基础数值
    public computedEffect(id: string, effectBase: EffectBase) {
        const scenario = this.scenarioMap.get(id)
        const effect = scenario.effect

        const keys = Object.keys(effect)

        keys.forEach(key => {
            const effectDetail = effect[key] as ScenarioEffectReact
            if(effectDetail.value !== 0){
                if(effectDetail.type === ScenarioEffectReactType.add){
                    effectBase[key]  = effectBase[key] + effectDetail.value
                }
                if(effectDetail.type === ScenarioEffectReactType.sub){
                    effectBase[key] = effectBase[key] - effectDetail.value
                }
                if(effectDetail.type === ScenarioEffectReactType.mult){
                    effectBase[key] = effectBase[key] + (effectBase[key] * effectDetail.value)
                }
                if(effectDetail.type === ScenarioEffectReactType.div){
                    effectBase[key] = effectBase[key] + (effectBase[key] / effectDetail.value)
                }
            }
        })

        return effectBase
    }
}

