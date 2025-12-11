// AudioPoolManager.ts（全局单例，管理音频池）
import { _decorator, Component, AudioSource, AudioClip, Node} from "cc"
const { ccclass, property } = _decorator

@ccclass("AudioPoolManager")
export default class AudioPoolManager {
    private static Instance: AudioPoolManager
    private audioPool: AudioSource[] = [] // 音频源池
    private poolSize = 50 // 池大小（根据需求调整，如 5~10 个）
    private poolNode: Node // 存储音频池组件的节点

    private constructor() { }

    // 获取单例
    public static getInstance(): AudioPoolManager {
        if (!this.Instance) {
            this.Instance = new AudioPoolManager()
            this.Instance.initPool() // 初始化池
        }
        return this.Instance
    }

    // 初始化音频池（创建多个 AudioSource 组件）
    private initPool(): void {
        // 创建一个专门存储音频池的节点（避免污染节点树）
        this.poolNode = new Node("AudioPoolNode")
        this.poolNode.parent = null // 脱离节点树（常驻内存）

        // 创建指定数量的 AudioSource 并加入池
        for (let i = 0; i < this.poolSize; i++) {
            const audioSource = this.poolNode.addComponent(AudioSource)
            audioSource.loop = false // 禁用循环（单次播放音效）
            this.audioPool.push(audioSource)

            // 监听音频播放完成，归还到池
            audioSource.node.on(AudioSource.EventType.ENDED, () => {
                this.returnToPool(audioSource)
            })
        }
    }

    // 从池中获取空闲的 AudioSource
    private getFreeAudioSource(): AudioSource | null {
        // 查找未在播放的 AudioSource
        const freeSource = this.audioPool.find(source => !source.playing)
        if (freeSource) return freeSource

        // 可选：池满时动态扩容（避免音效丢失）
        console.warn("音频池已满，动态扩容")
        const newSource = this.poolNode.addComponent(AudioSource)
        newSource.loop = false
        newSource.node.on(AudioSource.EventType.ENDED, () => {
            this.returnToPool(newSource)
        })
        this.audioPool.push(newSource)
        return newSource
    }

    // 将 AudioSource 归还到池（播放完成后自动调用）
    private returnToPool(source: AudioSource): void {
        // 重置音频（避免残留状态）
        source.stop()
        source.clip = null
    }

    /**
     * 播放音频（同一资源可同时多次播放）
     * @param clip 要播放的 AudioClip
     * @param volume 音量（0~1，默认 1）
     */
    public playAudio(clip: AudioClip, volume: number = 1): void {
        if (!clip) {
            console.error("音频资源为空！")
            return
        }

        const audioSource = this.getFreeAudioSource()
        if (audioSource) {
            audioSource.clip = clip
            audioSource.volume = volume
            audioSource.play() // 播放（不会中断其他音频）
        }
    }

    // 停止所有音频播放
    public stopAllAudios(): void {
        this.audioPool.forEach(source => {
            source.stop()
            source.clip = null
        })
    }
}