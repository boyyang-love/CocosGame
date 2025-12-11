import { director, PhysicsSystem2D, Tween } from "cc"
import { GAMESTATUS } from "../../../Constant/Enum"

export class GameManager {
    private static Instance: GameManager

    public gameStatus: GAMESTATUS = GAMESTATUS.PLAY

    // 获取单例
    public static getInstance(): GameManager {
        if (!this.Instance) {
            this.Instance = new GameManager()
        }
        return this.Instance
    }

    pause() {
        PhysicsSystem2D.instance.enable = false
        this.gameStatus = GAMESTATUS.PAUSE
        director.pause()
    }

    play() {
        PhysicsSystem2D.instance.enable = true
        this.gameStatus = GAMESTATUS.PLAY
        director.resume()
    }
}

