import { _decorator, Component, instantiate, Node, Prefab, sp, Vec3 } from 'cc'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { ARMSTYPE, OWNERTYPE } from '../Constant/Enum'
import { AttackAttr } from '../Game/Attack/AttackAttr'
import { AutoAttack } from '../Game/Attack/AutoAttack'
import { EnemyMove } from '../Game/Move/EnemyMove'
const { ccclass, property } = _decorator

@ccclass('CreateEnemys')
export class CreateEnemys extends Component {

    private player: Node = null

    protected onLoad() {

    }

    start() {
        this.initGameScene()
    }

    update(deltaTime: number) {

    }

    initGameScene() {
        this.initPlayer().then(() => {
            this.initEnemy()
        })
    }

    async initPlayer() {
        const playerPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Player/Player", Prefab)
        const armsPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Arms/Sword", Prefab)

        const playerNode = instantiate(playerPrefab)

        const autoAttackScript = playerNode.getComponent(AutoAttack)

        autoAttackScript.armsOwner = OWNERTYPE.PLAYER
        autoAttackScript.armsCount = 10
        autoAttackScript.armsPrefab = armsPrefab
        autoAttackScript.armsType = ARMSTYPE.MELEE
        autoAttackScript.attackAttr = new AttackAttr()
        autoAttackScript.attackSpeed = 50
        autoAttackScript.attackRange = 100

        this.node.addChild(playerNode)
        playerNode.setWorldPosition(new Vec3(0, 0, 0))

        this.player = playerNode
    }

    async initEnemy() {
        for (let i = 0; i < 100; i++) {
            const spiderPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "NPC/Spider", Prefab)
            const armsPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "Arms/FireBall", Prefab)
            const spiderNode = instantiate(spiderPrefab)

            const enemyMoveScript = spiderNode.getComponent(EnemyMove)
            enemyMoveScript.targetNode = this.player
            enemyMoveScript.attackRange = 150

            // 设置攻击相关行为
            const spiderAutoAttackScript = spiderNode.getComponent(AutoAttack)
            spiderAutoAttackScript.armsCount = 5
            spiderAutoAttackScript.attackAngle = 90
            spiderAutoAttackScript.armsPrefab = armsPrefab
            spiderAutoAttackScript.attackAttr = new AttackAttr()
            spiderAutoAttackScript.armsOwner = OWNERTYPE.ENEMY
            spiderAutoAttackScript.armsType = ARMSTYPE.RANGED
            spiderAutoAttackScript.attackSpeed = 10
            spiderAutoAttackScript.attackRange = 200
            spiderAutoAttackScript.attackTargetNode = this.player
            spiderNode.setWorldPosition(new Vec3(300, 500, 0))

            this.node.addChild(spiderNode)
        }
    }
}

