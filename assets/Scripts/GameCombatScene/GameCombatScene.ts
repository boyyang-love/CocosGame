import { _decorator, AssetManager, assetManager, AudioSource, Component, find, instantiate, Label, Node, Prefab, Script } from 'cc'
import { ScenarioManager } from '../Game/Framework/Managers/ScenarioManager'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { DialogItem } from './DialogItem'
import { PlayerManager } from '../Game/GameManager/PlayerManager'
import { Progress } from '../Progress/Progress'
import { EXPType, HPType, MPType } from '../Constant/Enum'
const { ccclass, property } = _decorator

@ccclass('GameCombatScene')
export class GameCombatScene extends Component {
    @property(Node)
    content: Node = null
    //点击音效
    @property({
        type: AudioSource,
        tooltip: "点击按钮音效"
    })
    clickAudio: AudioSource = null

    private day: number = 1

    start() {
        new PlayerManager().Init()
        this.updateStatus()
        this.setSkills()
    }

    update(deltaTime: number) {

    }

    public nextButtonClick() {
        const data = ScenarioManager.Instance.getScenarioRandom()
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Item", Prefab).then((prefab) => {
            const prefabNode = instantiate(prefab)
            const prefabComp = prefabNode.getComponent(DialogItem)
            const playerStatus = PlayerManager.Instance.getPlayerStatus()


            prefabComp.setLabel(this.day.toString(), data.descript, "-15%")

            const computedEffect = ScenarioManager.Instance.computedEffect(data.id, {
                HP: playerStatus.HP,
                MP: playerStatus.MP,
                DEF: playerStatus.DEF,
                ATK: playerStatus.ATK,
            })

            PlayerManager.Instance.setHP(computedEffect.HP, HPType.HP)
            PlayerManager.Instance.setMP(computedEffect.MP, MPType.MP)
            PlayerManager.Instance.setDEF(computedEffect.DEF)
            PlayerManager.Instance.setATK(computedEffect.ATK)

            this.content.addChild(prefabNode)
            
            this.clickAudio.play()

            this.updateStatus()
            
        })
    }

    updateStatus() {
        // 获取玩家数据
        const playerStatus = PlayerManager.Instance.getPlayerStatus()
        // 获取status 节点
        const statusNode = this.node.getChildByName("PlayerStatus")
        // 获取HP节点 以及脚本
        const hpNode = statusNode.getChildByName("HP")
        const hpScript = hpNode.getComponent(Progress)
        // 获取MP节点 以及脚本
        const mpNode = statusNode.getChildByName("MP")
        const mpScript = mpNode.getComponent(Progress)

        // 设置值
        hpScript.setLabel(playerStatus.HP, playerStatus.MaxHP)
        mpScript.setLabel(playerStatus.MP, playerStatus.MaxMP)
    }

    setSkills(){
        ResourceManager.Instance.AwaitGetAsset("Prefabs", "Skills/Spark", Prefab).then((prefab) => {
            const skillNode = instantiate(prefab)
            const playerNode = this.node.getChildByName("Player")
            skillNode.setPosition(0, 0)
            playerNode.addChild(skillNode)
        })
    }
}

