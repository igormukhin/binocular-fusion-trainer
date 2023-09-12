import {Controllable, ExerciseProvider, Side, SidedShapes} from "./Common.ts";
import {Shape} from "two.js/src/shape";
import anime from "animejs/lib/anime.es.js";
import {randomItem, randomSign} from "../support/Random.ts";

export const exerciseProviders: ExerciseProvider[] = [
  {
    name: 'No movement',
    animate: noMovement,
  },
  {
    name: 'Convergence Massage',
    animate: convergenceMassageAnimation,
  },
  {
    name: 'Random Jumps',
    animate: randomJumpsAnimation,
  },
]

function noMovement(_: SidedShapes, updateCallback: () => void): Controllable {
  updateCallback();
  return {
    pause: () => {
    }
  }
}

function convergenceMassageAnimation(eyeImages: SidedShapes, updateCallback: () => void): Controllable {
  const speed = 200;
  const moveIn = 5;
  const moveOut = 5;

  function animateEyeMovement(image: Shape, direction: number) {
    return anime({
      targets: image.position,
      keyframes: [
        {x: moveOut * direction, duration: speed * moveOut},
        {x: 0, duration: speed * moveOut},
        {x: moveIn * -direction, duration: speed * moveIn},
        {x: 0, duration: speed * moveIn},
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
  const minJumpDistance = 4;
  const maxJumpDistance = 20;
  const duration = 5000;

  let animation = animate();

  function animate() {
    const jumpDistance = Math.floor(Math.random() * (maxJumpDistance - minJumpDistance + 1)) + minJumpDistance;
    return anime({
      targets: randomItem(Object.values(eyeImages)).position,
      keyframes: [
        {x: 0, duration: duration / 4},
        {x: jumpDistance * randomSign(), duration: duration / 2},
        {x: 0, duration: duration / 4},
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
