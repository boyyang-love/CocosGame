import { _decorator, Component, instantiate, math, Node, Prefab, Vec3 } from 'cc'
import { ResourceManager } from '../Framework/Managers/ResourceManager'
import { Arms } from '../Arms/Arms'
import { OWNERTYPE } from '../../Constant/Enum'
const { ccclass, property } = _decorator

@ccclass('PlayerAttack')
export class PlayerAttack extends Component {

    @property({ tooltip: "攻击范围" })
    attackRange: number = 30
    @property({ tooltip: "攻击速度" })
    attackSpeed: number = 200
    @property({ tooltip: "攻击武器" })
    attackArm: Prefab = null
    @property({ tooltip: "武器数量" })
    armsValue: number = 10

    @property
    radius: number = 100 // 旋转半径（元素到角色中心的距离）

    private angles: number[] = [] // 每个元素的初始角度（避免重叠）

    private armsItems: Node[] = []


    protected onLoad() {
        this.initPlayerArm()
    }

    start() {
        // 初始化每个元素的初始角度（平均分配）
        const step = 360 / this.armsValue
        Array.from({ length: this.armsValue }).forEach((item, index) => {
            this.angles.push(index * step)
        })
    }

    update(deltaTime: number) {
        this.angles = this.angles.map(angle => {
            return (angle + this.attackSpeed * deltaTime) % 360
        })

        this.armsItems.forEach((item, index) => {
            const playerNodePos = this.node.worldPosition
            const angle = this.angles[index] * Math.PI / 180 // 角度转弧度
            const x = this.radius * Math.cos(angle)
            const y = this.radius * Math.sin(angle)
            item.setWorldPosition(new Vec3(x+playerNodePos.x, y+playerNodePos.y, 0))
        })
    }

    initPlayerArm() {
        Array.from({ length: this.armsValue }).forEach((_, i) => {
            ResourceManager.Instance.AwaitGetAsset("Prefabs", "Arms/sword", Prefab).then((prefab) => {
                const node = instantiate(prefab)
                if(node.getComponent(Arms)){
                    node.getComponent(Arms).ownerType = OWNERTYPE.PLAYER
                }else{
                    console.warn("未挂载Arms脚本")
                }
                
                this.node.parent.addChild(node)
                const angle = this.angles[i] * Math.PI / 180 // 角度转弧度
                const playerNodePos = this.node.worldPosition
                // 三角函数计算坐标（x = r*cosθ, y = r*sinθ）
                const x = this.radius * Math.cos(angle)
                const y = this.radius * Math.sin(angle)
                node.setWorldPosition(new Vec3(x + playerNodePos.x, y + playerNodePos.y, 0))

                this.armsItems.push(node)
            })
        })
    }
}

