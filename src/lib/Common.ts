import {Shape} from "two.js/src/shape";
import Two from "two.js";

export enum Side {
  Left,
  Right,
}

export type SidedShapes = {
  [key in Side]: Shape;
}

export interface EyeImageProvider {
  name: string;
  make: (two: Two) => SidedShapes;
}

export interface ExerciseProvider {
  name: string;
  animate: (eyeImages: SidedShapes, updateCallback: () => void) => Controllable;
}

export interface Controllable {
  pause: () => void;
}
