import { _decorator, Component, director, Node } from 'cc'
import { ResourceManager } from './Framework/Managers/ResourceManager'
import { PlayerStateManager } from './GameManager/PlayerStateManager'
import { SkillManager } from './GameManager/SkillManager'

export class GameApp extends Component {
    public static Instance: GameApp = null

    protected onLoad(): void {
        if (GameApp.Instance === null) {
            GameApp.Instance = this
        } else {
            this.destroy
        }
    }

    public Init(): void {
        this.InitGameManager()
    }

    InitGameManager() {
        new ResourceManager().Init()
        new PlayerStateManager().Init()
        SkillManager.getInstance().loadConfigs()
    }

    public async EnterGame() {
        director.preloadScene("GameBeginScene", () => {
            director.loadScene("GameBeginScene")
        })
    }
}

