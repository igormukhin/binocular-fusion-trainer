export interface Settings {
    shouldDrawCentralGuide: boolean;
    eyeGap: number;
    eyeImageFactoryName: string;
    exerciseName: string;
    innerMuscleStretching: {
        moveOut: number;
    };
    convergenceMassage: {
        moveOut: number;
    }
}

export function persistSettings(settings: Settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
}

export function loadSettings(): Settings | null {
    const settings = localStorage.getItem('settings');
    if (settings) {
        return JSON.parse(settings);
    } else {
        return null;
    }
}
