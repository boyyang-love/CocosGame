import { _decorator, Component, director, Node } from 'cc'
import { SkillsManager } from './GameManager/SkillsManager'
import { SkillConfigManager } from './Framework/Managers/SkillConfigManager'
import { ResourceManager } from './Framework/Managers/ResourceManager'
import { PlayerStateManager } from './GameManager/PlayerStateManager'

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
        new SkillsManager().Init()
        new SkillConfigManager().Init()
        new ResourceManager().Init()
        new PlayerStateManager().Init()
    }

    public async EnterGame() {
        director.preloadScene("GameBeginScene", () => {
            director.loadScene("GameBeginScene")
        })
    }
}

