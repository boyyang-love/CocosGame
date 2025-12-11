import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc'
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { CoolDown } from '../Game/CoolDown/CoolDown'
import { EventManager } from '../Game/Framework/Managers/EventManager'
import { ASSETPATH, CUSTOMEVENTNAME } from '../Constant/Enum'
const { ccclass, property } = _decorator

@ccclass('SetSkillLabel')
export class SetSkillLabel extends Component {
    private coolDownNodes: Node[] = []
    start() {
        EventManager.instance.on(CUSTOMEVENTNAME.SKILLCHANGE, () => {
            if(this.coolDownNodes.length){
                this.coolDownNodes.forEach(node => {
                    this.node.removeChild(node)
                })
            }
            this.renderSprite()
        })
    }

    update(deltaTime: number) {
    }

    renderSprite() {
        PlayerStateManager.Instance.skills.forEach(async info => {
            resources.load(`${info.icon}/spriteFrame`, SpriteFrame, async (err, data) => {
                const coolDown = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "CoolDown/CoolDown", Prefab)
                const collDownNode = instantiate(coolDown)
                const coolDownScript = collDownNode.getComponent(CoolDown)
                coolDownScript.icon.spriteFrame = data
                coolDownScript.collDown = info.armsProp.attackSpace
                coolDownScript.skillId = info.id
                this.node.addChild(collDownNode)
                this.coolDownNodes.push(collDownNode)
            })
        })
    }
}

