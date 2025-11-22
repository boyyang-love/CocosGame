import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Progress')
export class Progress extends Component {
    @property(Label)
    public current: Label  = null
    @property(Label)
    public total: Label = null
    @property (ProgressBar)
    public progressBar: ProgressBar


    public setLabel(current: number, total: number) {
        this.current.string = current.toString()
        this.total.string = total.toString()

        this.progressBar.progress = current / total
    }
}

