import { _decorator, Component, instantiate, Label, Node, Prefab, v3 } from 'cc'

const { ccclass, property } = _decorator

@ccclass('Status')
export class Status extends Component {
    public static Instance: Status = null

    @property(Label)
    private energy: Label = null
    @property(Number)
    private energyVal: number = 0

    @property(Label)
    private coin: Label = null
    @property(Number)
    private coinVal: number = 0

    @property(Label)
    private power: Label = null
    @property(Number)
    private powerVal: number = 100

    protected onLoad(): void {
        if (Status.Instance === null) {
            Status.Instance = this
        } else {
            this.destroy()
        }
    }

    start() {
        this.initStatus()
    }

    update(deltaTime: number) {

    }

    initStatus() {
        this.energy.string = this.energyVal.toString()
        this.coin.string = this.coinVal.toString()
        this.power.string = this.powerVal.toString()
    }
}

