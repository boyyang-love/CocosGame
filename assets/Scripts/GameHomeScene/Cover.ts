import { _decorator, Component, Node, Sprite, UITransform, Vec3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('Cover')
export class Cover extends Component {

    private coverInitPos: Vec3
    private coverTransform: UITransform
    private coverNode: Node

    start() {
        this.coverNode = this.node
        this.coverTransform = this.getComponent(UITransform)
        const initPos = this.coverNode.getPosition()
        this.coverInitPos = new Vec3(initPos.x, initPos.y, initPos.z)
        
    }

    update(deltaTime: number) {
        let pos = this.node.getPosition()
        if (pos.x + this.coverInitPos.x + this.coverTransform.contentSize.width <= 0) {
            this.node.setPosition(this.coverInitPos)
        } else {
            pos.x -= 100 * 1 * deltaTime
            this.node.setPosition(pos)
        }
    }
}

