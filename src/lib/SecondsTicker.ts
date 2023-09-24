import {Ref} from "vue";

export class SecondsTicker {
    private readonly onUpdate: (secs: number) => void;
    private timer: number = 0;
    private elapsed: number = 0;

    constructor(onUpdate: (secs: number) => void) {
        this.onUpdate = onUpdate;
        this.restart();
    }

    static forRef(refNumber: Ref<number>): SecondsTicker {
        return new SecondsTicker((secs) => refNumber.value = secs);
    }

    restart() {
        this.stop();

        this.timer = setInterval(() => {
            this.elapsed++;
            this.onUpdate(this.elapsed);
        }, 1000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.elapsed = 0;
        this.onUpdate(this.elapsed);
    }
}

export function formatMinSecs(secs: number): string {
    const minutes = Math.floor(secs / 60) % 60;
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
