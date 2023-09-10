import {EyeImageProvider, Side, SidedShapes} from "./Common.ts";
import Two from "two.js";

export const eyeImageFactories: EyeImageProvider[] = [
  {
    name: "Circle",
    make: makeCircles
  },
  {
    name: "Semi-Disconnected Brackets",
    make: makeSemiDisconnectedBrackets,
  },
  {
    name: "Disconnected Cross",
    make: makeDisconnectedCross
  }
]

function makeCircles(two: Two): SidedShapes {
  function makeEyeImage() {
    const radius = 32;
    const linewidth = 3;

    const circle = two.makeCircle(0, 0, radius);
    circle.stroke = 'black';

    const hline = two.makeLine(-radius / 2, 0, radius / 2, 0)
    hline.stroke = '#0088ff';

    const vline = two.makeLine(0, -radius / 2, 0, radius / 2)
    vline.stroke = '#ff8800';

    const group = two.makeGroup(circle, hline, vline);
    group.linewidth = linewidth;

    return group;
  }

  return {
    [Side.Left]: makeEyeImage(),
    [Side.Right]: makeEyeImage(),
  }
}

function makeSemiDisconnectedBrackets(two: Two): SidedShapes {
  function makeEyeImage(side: Side) {
    const size = 64;
    const innerCircleRadius = 8;
    const linewidth = 3;

    const circle1 = two.makeCircle(0, 0, innerCircleRadius);
    const circle2 = two.makeCircle(0, 0, innerCircleRadius * 2);
    circle2.noFill()

    const k = side === Side.Left ? -1 : 1;
    const path = two.makePath(0, -size/2, k*size/2, -size/2, k*size/2, size/2, 0, size/2);
    path.closed = false;
    path.noFill();

    const group = two.makeGroup(circle1, circle2, path);
    circle2.stroke = 'black';
    group.linewidth = linewidth;

    return group;
  }

  return {
    [Side.Left]: makeEyeImage(Side.Left),
    [Side.Right]: makeEyeImage(Side.Right),
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
