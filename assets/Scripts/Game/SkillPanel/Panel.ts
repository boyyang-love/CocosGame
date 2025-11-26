import { _decorator, Component, Label, Node, NodeEventType } from 'cc'
import { SkillPanel } from './SkillPanel'
const { ccclass, property } = _decorator

@ccclass('Panel')
export class Panel extends Component {
    @property(Label)
    titleLabel: Label = null
    @property(Label)
    contentLabel: Label = null
    @property({ tooltip: '编号', type: Number })
    index: number = 0

    public isSelected: boolean = false
    public title: string = ''
    public content: string = ''

    start() {

    }

    update(deltaTime: number) {
        if (SkillPanel.Instance.index === this.index) {
            this.setSelect(true)
        } else {
            this.setSelect(false)
        }
    }

    public setValue(title: string, content: string) {
        this.titleLabel.string = title
        this.contentLabel.string = content
    }

    public setSelect(value: boolean) {
        this.isSelected = value
        const node = this.node.children.filter(node => node.name === "Select")
        node.forEach(node => {
            node.active = value
        })
    }

    public panelClick() {
        this.setSelect(true)
        SkillPanel.Instance.index = this.index
    }
}

