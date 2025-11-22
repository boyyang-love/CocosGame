import { Prefab } from "cc"
import { AttackAttr } from "../Attack/AttackAttr"
import { ARMSTYPE } from "../../Constant/Enum"

export class Skills  {
    skillName: string
    skillPrefab: Prefab 
    skillPrefabType: ARMSTYPE
    skillAttackAttr: AttackAttr
}

