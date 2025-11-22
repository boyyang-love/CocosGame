import { _decorator, Component, director, Enum, NodeEventType, AudioSource } from 'cc'
import { MenuType } from '../Constant/Enum'
import { Menu } from '../GameHomeScene/Menu'
const { ccclass, property, type } = _decorator

@ccclass('MenuItem')
export class MenuItem extends Component {
    @type(Enum(MenuType))
    menu: MenuType = MenuType.skill

    @property(AudioSource)
    mouseClickAudio: AudioSource = null

    start() {
        this.node.on(NodeEventType.TOUCH_START, this.menuClick.bind(this))
    }

    update(deltaTime: number) {
        const activeNode = this.node.getChildByName("MenuActive")
        if (this.menu !== Menu.Instance.menuActive) {
            activeNode.active = false
        } else {
            activeNode.active = true
        }
    }

    menuClick() {
        Menu.Instance.menuActive = this.menu
        this.mouseClickAudio.play()

        if(this.menu === MenuType.battle){
            director.loadScene("GameCombatScene")
        }
    }
}

