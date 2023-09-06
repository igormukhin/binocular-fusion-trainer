<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import Two from 'two.js';
import anime from 'animejs/lib/anime.es.js';
import {Shape} from "two.js/src/shape";
import {randomItem, randomSign} from "./support/random.ts";

enum Side {
  Left,
  Right,
}

type SidedShapes =  {
  [key in Side]: Shape;
}

interface EyeImageFactory {
  name: string;
  make: () => SidedShapes;
}

const eyeImageFactories: EyeImageFactory[] = [
  {
    name: "Circle",
    make: () => {
      function makeEyeImage() {
        const radius = 32;

        const circle = two.makeCircle(0, 0, radius);
        circle.stroke = 'black';

        const hline = two.makeLine(-radius/2, 0, radius/2, 0)
        hline.stroke = '#44ff44';

        const vline = two.makeLine(0, -radius/2, 0, radius/2)
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

interface Exercise {
  name: string;
  animation: () => Controllable;
}

interface Controllable {
  pause: () => void;
}

const exercises: Exercise[] = [
  {
    name: 'Convergence Massage',
    animation: convergenceMassageAnimation,
  },
  {
    name: 'Random Jumps',
    animation: randomJumpsAnimation,
  },
];

const stage = ref(null);
const two = new Two({ fitted: true });
let eyeImages: SidedShapes;
let eyeImagePlaceholders: SidedShapes;

const selectedExercise = ref(exercises[0]);
let currentAnimation: any;

function resetEyeImagePositions() {
  const eyeGap = 200;

  eyeImagePlaceholders[Side.Left].position.set(two.width / 2 - (eyeGap / 2), two.height / 2);
  eyeImagePlaceholders[Side.Right].position.set(two.width / 2 + (eyeGap / 2), two.height / 2);
}

function animateImageRotation() {
  anime({
    targets: Object.values(eyeImages),
    rotation: Math.PI * 2,
    duration: 20000,
    easing: 'linear',
    autoplay: true,
    loop: true,
    update: () => two.update(),
  });
}

function convergenceMassageAnimation(): Controllable {
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
      update: () => two.update(),
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

function randomJumpsAnimation(): Controllable {
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
      update: () => two.update(),
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

function createSceneImages() {
  eyeImages = eyeImageFactories[0].make();

  eyeImagePlaceholders = {
    [Side.Left]: two.makeGroup(eyeImages[Side.Left]),
    [Side.Right]: two.makeGroup(eyeImages[Side.Right]),
  }
}

onMounted(() => {
  two.appendTo(stage.value!!);
  createSceneImages();
  resetEyeImagePositions();
  two.update();
  animateImageRotation();
  applySettings();
});

onBeforeUnmount(() => {
  two.clear();
});

function applySettings() {
  if (currentAnimation) {
    currentAnimation.pause();
  }

  currentAnimation = selectedExercise.value.animation();
}

</script>

<template>
  <div class="work_area">
    <div ref="stage" class="stage"></div>
    <div class="control_panel">
      <div class="title">Binocular Fusion Trainer</div>

      <div>
        <select v-model="selectedExercise">
          <option v-for="exercise in exercises" :key="exercise.name" :value="exercise">{{ exercise.name }}</option>
        </select>
      </div>
      <div>
        <button @click="applySettings">Apply</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.work_area {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
}

.stage {
  height: 100%;
  flex-grow: 2;
}

.control_panel {
  width: 400px;
  background-color: antiquewhite;
  height: 100%;
}
</style>