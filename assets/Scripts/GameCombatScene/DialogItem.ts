import { _decorator, Component, Label, Node } from 'cc'
const { ccclass, property } = _decorator

@ccclass('DialogItem')
export class DialogItem extends Component {

    @property(Label)
    dayLabel: Label = null

    @property(Label)
    content: Label = null

    @property(Label)
    iconLabel: Label = null

    start() {

    }

    update(deltaTime: number) {

    }

    public setLabel(daylabel: string, contentLabel: string, iconLabel: string) {
        this.dayLabel.string = daylabel
        this.content.string = contentLabel
        this.iconLabel.string = iconLabel
    }
}

