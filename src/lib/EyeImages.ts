import {EyeImageProvider, Side, SidedShapes} from "./Common.ts";
import Two from "two.js";

export const eyeImageFactories: EyeImageProvider[] = [
  {
    name: "Circle",
    make: makeCircles
  },
  {
    name: "Disconnected Cross",
    make: makeDisconnectedCross
  }
]

function makeCircles(two: Two): SidedShapes {
  function makeEyeImage() {
    const radius = 32;

    const circle = two.makeCircle(0, 0, radius);
    circle.stroke = 'black';

    const hline = two.makeLine(-radius / 2, 0, radius / 2, 0)
    hline.stroke = '#44ff44';
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

function makeDisconnectedCross(two: Two): SidedShapes {
  const length = 80;
  const thickness = 8;

  function makeHorizontalLine() {
    const line1 = two.makeLine(-length/2 , 0, -thickness/2, 0);
    const line2 = two.makeLine(thickness/2, 0, length/2, 0);

    const group = two.makeGroup(line1, line2);
    group.linewidth = thickness;
    return group;
  }

  function makeVerticalLine() {
    const line1 = two.makeLine(0 , -length/2, 0, -thickness/2);
    const line2 = two.makeLine(0, thickness/2, 0, length/2);

    const group = two.makeGroup(line1, line2);
    group.linewidth = thickness;
    return group;
  }

  return {
    [Side.Left]: makeHorizontalLine(),
    [Side.Right]: makeVerticalLine(),
  }
}
