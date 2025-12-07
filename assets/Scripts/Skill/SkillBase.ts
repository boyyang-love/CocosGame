import { _decorator, Component, Node } from 'cc';
import { Config } from '../../Types/Config'
const { ccclass, property } = _decorator;

@ccclass('SkillBase')
export class SkillBase extends Component {
    
    public skillConfig: Config.SkillConfig = null
    

    start() {

    }

    update(deltaTime: number) {
        
    }
}

