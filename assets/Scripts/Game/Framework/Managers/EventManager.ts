import { _decorator, Component, Node, EventTarget } from 'cc'
import { CUSTOMEVENTNAME } from '../../../Constant/Enum'
const { ccclass } = _decorator

// 单例类：全局唯一的 EventTarget 实例
@ccclass('EventManager')
export class EventManager {
    // 1. 静态实例（保证全局唯一）
    private static _instance: EventManager
    // 2. 核心：EventTarget 实例
    public eventTarget: EventTarget

    // 私有化构造函数，禁止外部 new
    private constructor() {
        this.eventTarget = new EventTarget()
    }

    // 3. 获取单例的静态方法
    public static get instance(): EventManager {
        if (!this._instance) {
            this._instance = new EventManager()
        }
        return this._instance
    }

    // 封装事件订阅（简化调用）
    public on(eventName: CUSTOMEVENTNAME, callback: (...args: any[]) => void, target?: any) {
        this.eventTarget.on(eventName, callback, target)
    }

    // 封装事件派发（简化调用）
    public emit(eventName: CUSTOMEVENTNAME, ...args: any[]) {
        this.eventTarget.emit(eventName, ...args)
    }

    // 封装事件取消订阅（防止内存泄漏）
    public off(eventName: CUSTOMEVENTNAME, callback: (...args: any[]) => void, target?: any) {
        this.eventTarget.off(eventName, callback, target)
    }
}