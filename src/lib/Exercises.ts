import {Controllable, ExerciseProvider, Side, SidedShapes} from "./Common.ts";
import {Shape} from "two.js/src/shape";
import anime from "animejs/lib/anime.es.js";
import {randomItem, randomSign} from "../support/Random.ts";

export const exerciseProviders: ExerciseProvider[] = [
    {
        name: 'Convergence Massage',
        animate: convergenceMassageAnimation,
    },
    {
        name: 'Random Jumps',
        animate: randomJumpsAnimation,
    },
]

function convergenceMassageAnimation(eyeImages: SidedShapes, updateCallback: () => void): Controllable {
  const duration = 20000;
  const moveOut = 20;

  function animateEyeMovement(image: Shape, direction: number) {
    return anime({
      targets: image.position,
      keyframes: [
        { x: moveOut * direction, duration: duration / 4 },
        { x: 0, duration: duration / 4 },
        { x: moveOut * -direction, duration: duration / 4 },
        { x: 0, duration: duration / 4 },
      ],
      easing: 'linear',
      autoplay: true,
      loop: true,
      update: updateCallback,
    });
  }

  const left = animateEyeMovement(eyeImages[Side.Left], -1);
  const right = animateEyeMovement(eyeImages[Side.Right], 1);

  return {
    pause: () => {
      left.pause();
      right.pause();
    }
  }
}

function randomJumpsAnimation(eyeImages: SidedShapes, updateCallback: () => void): Controllable {
  const jumpDistance = 10;
  const duration = 5000;

  let animation = animate();

  function animate() {
    return anime({
      targets: randomItem(Object.values(eyeImages)).position,
      keyframes: [
        { x: 0, duration: duration / 4 },
        { x: jumpDistance * randomSign(), duration: duration / 2 },
        { x: 0, duration: duration / 4 },
      ],
      easing: 'steps(1)',
      autoplay: true,
      update: updateCallback,
      complete: () => {
        animation = animate();
      }
    })
  }

  return {
    pause: () => {
      animation.pause();
    }
  }
}
