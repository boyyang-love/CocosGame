
export class SkillsManager {
    public static Instance: SkillsManager = null

    public Init() {
        if (SkillsManager.Instance === null){
            SkillsManager.Instance = new SkillsManager()
        }
    }

    
}

