import { _decorator, Component, Animation } from 'cc'
const { ccclass, property } = _decorator
import { MenuType } from '../Constant/Enum'

@ccclass('Menu')
export class Menu extends Component {
    @property(Animation)
    public anim: Animation = null

    public menuActive: MenuType = MenuType.skill

    public static Instance: Menu = null

    protected onLoad(): void {
        if(Menu.Instance === null){
            Menu.Instance = this
        }else{
            this.destroy()
        }
    }

    start() {
        this.changeMenuStatus()
    }

    update(deltaTime: number) {

    }

    changeMenuStatus() {
        this.anim.play()
    }
}

