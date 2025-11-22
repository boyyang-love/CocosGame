import { _decorator, Component, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SkillDialog')
export class SkillDialog extends Component {
    @property(Animation)
    public DialogAni: Animation = null

    start() {
        this.DialogAni.play()
    }

    update(deltaTime: number) {
        
    }
}

