
const randomPickFromNumberSet = (set: Set<number>, count: number = 3): number[] => {
    const arr = Array.from(set)
    if (arr.length <= count) return [...arr]

    // Fisher-Yates 洗牌（打乱数组前 count 个元素）
    for (let i = 0; i < count; i++) {
        const randomIndex = i + Math.floor(Math.random() * (arr.length - i));
        // 交换当前索引与随机索引的元素
        [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]]
    }

    // 返回前 count 个元素（已打乱且无重复）
    return arr.slice(0, count)
}

export {
    randomPickFromNumberSet
}