import { resources } from "cc"
import { ResourceManager } from "../Framework/Managers/ResourceManager"

export class SkillsManager {
    public static Instance: SkillsManager = null

    public Init() {
        if (SkillsManager.Instance === null){
            SkillsManager.Instance = new SkillsManager()
        }
    }
    

    public loadSkill(){
        resources.load("Config/SkillConfig", (err, data) => {
            if(err === null) {
                console.log(data)
            }
        })
    }
    
}

