import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Pop')
export class Pop extends Component {
    @property(Label)
    public value: Label = null

    start() {

    }

    update(deltaTime: number) {
        
    }

    public setValue(val: number) {
        this.value.string = val.toString()
    }

}

