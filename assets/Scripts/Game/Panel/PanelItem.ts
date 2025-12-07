import { _decorator, Component, Label, Node, NodeEventType } from 'cc'
import { Panel } from './Panel'
const { ccclass, property } = _decorator

@ccclass('PanelItem')
export class PanelItem extends Component {
    @property({ tooltip: "名称", type: Label })
    titleLabel: Label
    @property({ tooltip: "内容", type: Label })
    contentLabel: Label
    @property({ tooltip: "品质", type: Label })
    rarityLabel: Label
    
    public id: number = 0

    protected update(dt: number) {
        if (this.id !== Panel.Instance.id) {
            this.setSelect(false)
        }
    }

    // 设置内容
    public setItems(id: number, title: string, content: string, rarity?: string) {
        this.id = id
        this.titleLabel.string = title
        this.contentLabel.string = content
        this.rarityLabel.string = rarity ? rarity : ""
    }

    public setSelect(value: boolean) {
        const node = this.node.children.filter(node => node.name === "Select")
        node.forEach(node => {
            node.active = value
        })
    }

    public panelClick() {
        Panel.Instance.id = this.id
        this.setSelect(true)
    }
}

