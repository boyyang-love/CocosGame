import { _decorator, Component, director, Node, SpriteFrame } from 'cc';
import { GameApp } from './Game/GameApp'
const { ccclass } = _decorator;

@ccclass('Setup')
export class Setup extends Component {
    protected onLoad(): void {
        director.addPersistRootNode(this.node)
        this.InitGameFramework()
    }

    private InitGameFramework(): void {
        this.addComponent(GameApp).Init()
    }

    protected start(): void {
        GameApp.Instance.EnterGame()
    }
}

