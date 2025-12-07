import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc'
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { CoolDown } from '../Game/CoolDown/CoolDown'
import { EventManager } from '../Game/Framework/Managers/EventManager'
import { CUSTOMEVENTNAME } from '../Constant/Enum'
const { ccclass, property } = _decorator

@ccclass('SetSkillLabel')
export class SetSkillLabel extends Component {
    start() {
        EventManager.instance.on(CUSTOMEVENTNAME.SKILLCHANGE, () => {
            this.node.removeAllChildren()
            this.renderSprite()
        })
    }

    update(deltaTime: number) {
    }

    renderSprite() {
        PlayerStateManager.Instance.skill.forEach(async info => {
            resources.load(`${info.icon}/spriteFrame`, SpriteFrame, async (err, data) => {
                const coolDown = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "CoolDown/CoolDown", Prefab)
                const collDownNode = instantiate(coolDown)
                const coolDownScript = collDownNode.getComponent(CoolDown)
                coolDownScript.icon.spriteFrame = data
                coolDownScript.collDown = info.armsProp.attackSpace
                coolDownScript.skillId = info.id
                this.node.addChild(collDownNode)
            })
        })
    }
}

