import {EyeImageProvider, Side} from "./Common.ts";
import Two from "two.js";

export const eyeImageFactories: EyeImageProvider[] = [
    {
        name: "Circle",
        make: (two: Two) => {
            function makeEyeImage() {
                const radius = 32;

                const circle = two.makeCircle(0, 0, radius);
                circle.stroke = 'black';

                const hline = two.makeLine(-radius / 2, 0, radius / 2, 0)
                hline.stroke = '#44ff44';

                const vline = two.makeLine(0, -radius / 2, 0, radius / 2)
                vline.stroke = '#ff4444';

                const group = two.makeGroup(circle, hline, vline);
                group.linewidth = 2;

                return group;
            }

            return {
                [Side.Left]: makeEyeImage(),
                [Side.Right]: makeEyeImage(),
            }
        }
    }
]
