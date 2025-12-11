import { _decorator, Component, Node, RigidBody2D } from 'cc'
const { ccclass, property } = _decorator

@ccclass('ArmsStoreManager')
export class ArmsStoreManager extends Component {
    private static _instance: ArmsStoreManager

    private armsMap: Map<string, Node> = new Map()


    public static getInstance() {
        if (!this._instance) {
            this._instance = new ArmsStoreManager()
        }

        return this._instance
    }

    start() {

    }

    update(deltaTime: number) {

    }

    // 添加敌人到缓存
    public addArm(armsNode: Node): void {
        const armsId = armsNode.uuid // 用节点唯一ID作为key
        this.armsMap.set(armsId, armsNode)
    }

    // 从缓存移除敌人
    public removeArm(armsNode: Node): void {
        const armsId = armsNode.uuid
        this.armsMap.delete(armsId)
    }

    // 获取所有敌人节点
    public getAllArms(): Node[] {
        return Array.from(this.armsMap.values())
    }

    // 清空所有敌人缓存（场景切换时调用）
    public clearArms(): void {
        this.armsMap.clear()
    }

    public stop(){
        this.getAllArms().forEach(node => {
            console.log(node)
        })
    }
}

