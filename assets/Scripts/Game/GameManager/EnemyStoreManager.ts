import { _decorator, Component, math, Node, Vec2 } from 'cc'
const { ccclass, property } = _decorator

export interface EnemyStoreMapInfo {
    distance: number
    node: Node
}

@ccclass('EnemyStoreManager')
export class EnemyStoreManager {
    private static _instance: EnemyStoreManager

    private enemyMap: Map<string, EnemyStoreMapInfo> = new Map()


    public static getInstance() {
        if (!this._instance) {
            this._instance = new EnemyStoreManager()
        }

        return this._instance
    }

    // 添加敌人到缓存
    public addEnemy(enemyNode: Node): void {
        const enemyId = enemyNode.uuid // 用节点唯一ID作为key
        this.enemyMap.set(enemyId, {distance: 0, node: enemyNode})
    }

    // 从缓存移除敌人
    public removeEnemy(enemyNode: Node): void {
        const enemyId = enemyNode.uuid
        this.enemyMap.delete(enemyId)
    }

    // 获取所有敌人节点
    public getAllEnemies(): EnemyStoreMapInfo[] {
        return Array.from(this.enemyMap.values())
    }

    // 清空所有敌人缓存（场景切换时调用）
    public clearEnemies(): void {
        this.enemyMap.clear()
    }

    public findEnemiesInRange(point: Vec2, range: number): EnemyStoreMapInfo[] {
        const allEnemies = this.getAllEnemies()
        const nearbyEnemies: EnemyStoreMapInfo[] = []

        for (const enemy of allEnemies) {
            if (!enemy.node.active) continue // 跳过未激活的敌人

            // 计算角色与敌人的平面距离（2D 核心）
            const enemyPos = new Vec2(enemy.node.getWorldPosition().toVec2())
            const distance = Vec2.distance(point, enemyPos)
            console.log(point)
            enemy.distance = distance
            console.log(distance)
            console.log(enemyPos)
            // 筛选距离小于检测范围的敌人
            if (distance <= range) {
                nearbyEnemies.push(enemy)
            }
        }

        return nearbyEnemies.sort((a, b) => a.distance - b.distance)
    }
}

