import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameHomeScene')
export class GameHomeScene extends Component {
    @property(AudioSource)
    bg: AudioSource = null
    start() {
        // this.bg.play()
    }

    update(deltaTime: number) {
        
    }
}

