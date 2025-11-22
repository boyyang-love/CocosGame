import { _decorator, Component, Node, animation, director, AudioSource } from 'cc'
const { ccclass, property } = _decorator

@ccclass('beginGameBtn')
export class beginGameBtn extends Component {

    @property gameIsBegin: boolean = false

    @property(AudioSource)
    mouseClickAudio: AudioSource
    start() {
        

    }

    update(deltaTime: number) {

    }

    public gameStart() {
        this.mouseClickAudio.play()
        director.loadScene("GameHomeScene")
    }
}

