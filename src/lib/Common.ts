import {Shape} from "two.js/src/shape";
import Two from "two.js";

export enum Side {
  Left,
  Right,
}

export type SidedShapes = {
  [key in Side]: Shape;
}

export interface Controllable {
  pause: () => void;
}

export interface EyeImages extends Controllable {
  images: SidedShapes;
}

export interface EyeImageProvider {
  name: string;
  make: (two: Two) => EyeImages;
}

export interface ExerciseProvider {
  name: string;
  animate: (eyeImages: SidedShapes, updateCallback: () => void) => Controllable;
}
