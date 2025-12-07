import { _decorator, Camera, Component, instantiate, Node, Prefab, sp, Vec3 } from 'cc'
import { ResourceManager } from '../Game/Framework/Managers/ResourceManager'
import { ARMSTYPE, OWNERTYPE } from '../Constant/Enum'
import { AttackAttr } from '../Game/Attack/AttackAttr'
import { AutoAttack } from '../Game/Attack/AutoAttack'
import { EnemyMove } from '../Game/Move/EnemyMove'
import { CameraFollow2D } from '../Game/Framework/Managers/CameraFollow2D'
import { PlayerStateManager } from '../Game/GameManager/PlayerStateManager'
import { SkillManager } from '../Game/GameManager/SkillManager'
import { PlayerManager } from '../Game/GameManager/PlayerManager'
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

        // PlayerManager.Instance.mountSkill(1001)
        PlayerManager.Instance.mountSkill(1002)

    }

    async initEnemy() {
        for (let i = 0; i < 50; i++) {
            const spiderPrefab = await ResourceManager.Instance.AwaitGetAsset("Prefabs", "NPC/Spider", Prefab)
            const spiderNode = instantiate(spiderPrefab)

            const enemyMoveScript = spiderNode.getComponent(EnemyMove)
            enemyMoveScript.targetNode = this.player
            enemyMoveScript.attackRange = 150
            
            // 设置攻击相关行为
            // const spiderAutoAttackScript = spiderNode.getComponent(AutoAttack)
            // const skillInfo = await SkillManager.getInstance().getSkillConfigInfoById(1002)
            // skillInfo.armsOwner = OWNERTYPE.ENEMY
            // skillInfo.armsProp.attackRange = 200
            // spiderAutoAttackScript.skillConfig = skillInfo
            // spiderAutoAttackScript.attackAttr = new AttackAttr({
            //     basePhysicalDamage: 100,
            //     baseMagicDamage: 15,
            // })
            // spiderAutoAttackScript.attackTargetNode = this.player
            spiderNode.setWorldPosition(new Vec3(300, 500, 0))

            this.node.addChild(spiderNode)
        }
    }
}

