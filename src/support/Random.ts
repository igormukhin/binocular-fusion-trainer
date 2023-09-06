export function randomInt(max: number): number {
    return Math.floor(Math.random() * (max + 1));
}

export function randomItem<T>(items: T[]): T {
    return items[randomInt(1)];
}

export function randomSign(): number {
    return randomItem([-1, 1]);
}
