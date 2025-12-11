import { _decorator, Camera, Component, instantiate, Node, Prefab, sp, Vec3 } from 'cc'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { ARMSTYPE, ASSETPATH, OWNERTYPE } from '../Constant/Enum'
import { AttackAttr } from '../Game/Attack/AttackAttr'
import { AutoAttack } from '../Game/Attack/AutoAttack'
import { EnemyMove } from '../Game/Move/EnemyMove'
import { CameraFollow2D } from '../Game/Framework/Managers/CameraFollow2D'
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
import { SkillManager } from '../Game/GameManager/SkillManager'
import { PlayerManager } from '../Game/GameManager/PlayerManager'
import { EnemyManager } from '../Game/GameManager/EnemyManager'
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
        const playerPrefab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "Player/Player", Prefab)
        const playerNode = instantiate(playerPrefab)

        this.node.addChild(playerNode)
        playerNode.setWorldPosition(new Vec3(500, 500, 0))

        this.player = playerNode
        PlayerStateManager.Instance.PlayerNode = playerNode
        const cameraNode = this.node.getChildByName("Camera")

        const cameraScript = cameraNode.getComponent(CameraFollow2D)

        if (cameraScript) {
            cameraScript.target = this.player
        }

        PlayerStateManager.Instance.getSkill()
    }

    async initEnemy() {
        for (let i = 0; i < 50; i++) {
            const spiderPrefab = await ResourceManager.Instance.AwaitGetAsset(ASSETPATH.PREFAB, "NPC/Spider", Prefab)
            const spiderNode = instantiate(spiderPrefab)

            const enemyMoveScript = spiderNode.getComponent(EnemyMove)
            enemyMoveScript.targetNode = this.player
            enemyMoveScript.attackRange = 150

            const enemyManager = spiderNode.getComponent(EnemyManager)
            enemyManager.HP = 200

            enemyManager.mountSkill(1002)

            spiderNode.setWorldPosition(new Vec3(300, 500, 0))

            this.node.addChild(spiderNode)

        }
    }
}

