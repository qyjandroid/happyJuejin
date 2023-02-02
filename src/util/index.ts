export function delay(duration: number) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, duration);
    });
}


export function getBaseRandomValue(base: number, maxGap: number = 0) {
    const rd = Math.random();
    return base + (rd >  0.5 ? 1 : -1) * Math.random() * maxGap;
}