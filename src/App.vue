<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import Two from 'two.js';
import anime from 'animejs/lib/anime.es.js';
import {Controllable, Side, SidedShapes} from "./lib/Common.ts";
import {eyeImageFactories} from "./lib/EyeImages.ts";
import {exerciseProviders} from "./lib/Exercises.ts";
import {Shape} from "two.js/src/shape";

const stage = ref(null);
const two = new Two({ fitted: true });

const shouldDrawCentralGuide = ref(true);
let sceneBackground: Shape;

const selectedEyeImageFactory = ref(eyeImageFactories[0]);
let eyeImages: SidedShapes;
let eyeImagePlaceholders: SidedShapes;

const shouldAnimateEyeImages = ref(true);
let currentEyeImageAnimation: Controllable;

const selectedExercise = ref(exerciseProviders[0]);
let currentExerciseAnimation: Controllable;

function applySceneBackground() {
  if (sceneBackground) {
    sceneBackground.remove();
  }

  if (shouldDrawCentralGuide.value) {
    const line = two.makeLine(two.width / 2, 0, two.width / 2, two.height);
    line.stroke = 'black';
    line.opacity = 0.25;
    line.dashes = [1, 4];
    line.linewidth = 1;

    sceneBackground = two.makeGroup(line);
  }
}

function applyEyeImages() {
  if (eyeImages) {
    Object.values(eyeImages).forEach(eyeImage => eyeImage.remove());
  }

  eyeImages = selectedEyeImageFactory.value.make(two);
}

function applyEyeImagePositions() {
  const eyeGap = 320;

  if (eyeImagePlaceholders) {
    Object.values(eyeImagePlaceholders).forEach(eyeImagePlaceholder => eyeImagePlaceholder.remove());
  }

  eyeImagePlaceholders = {
    [Side.Left]: two.makeGroup(eyeImages[Side.Left]),
    [Side.Right]: two.makeGroup(eyeImages[Side.Right]),
  }

  eyeImagePlaceholders[Side.Left].position.set(two.width / 2 - (eyeGap / 2), two.height / 2);
  eyeImagePlaceholders[Side.Right].position.set(two.width / 2 + (eyeGap / 2), two.height / 2);
}

function applyEyeImageAnimation() {
  if (currentEyeImageAnimation) {
    currentEyeImageAnimation.pause();
  }

  if (shouldAnimateEyeImages.value) {
    currentEyeImageAnimation = anime({
      targets: Object.values(eyeImages),
      rotation: Math.PI * 2,
      duration: 20000,
      easing: 'linear',
      autoplay: true,
      loop: true,
      update: () => two.update(),
    });
  }
}

function applyExerciseAnimation() {
  if (currentExerciseAnimation) {
    currentExerciseAnimation.pause();
  }

  currentExerciseAnimation = selectedExercise.value.animate(eyeImages, () => two.update());
}

function applySettings() {
  applySceneBackground();
  applyEyeImages();
  applyEyeImagePositions();
  applyEyeImageAnimation();
  applyExerciseAnimation();
}

onMounted(() => {
  two.appendTo(stage.value!!);
  applySettings();
});

onBeforeUnmount(() => {
  two.clear();
});

</script>

<template>
  <div class="work_area">
    <div ref="stage" class="stage"></div>

    <div class="control_panel">
      <div class="title">Binocular Fusion Trainer</div>

      <div class="row">
        <input id="centralGuide" type="checkbox" v-model="shouldDrawCentralGuide" @change="applySettings">
        <label for="centralGuide" class="checkbox">Central guide</label>
      </div>
      <div class="row">
        <label for="eyeImage">Image:</label>
        <select id="eyeImage" v-model="selectedEyeImageFactory" @change="applySettings">
          <option v-for="factory in eyeImageFactories" :key="factory.name" :value="factory">{{ factory.name }}</option>
        </select>
      </div>
      <div class="row">
        <input id="animateEyeImages" type="checkbox" v-model="shouldAnimateEyeImages" @change="applySettings">
        <label for="animateEyeImages" class="checkbox">Animate images</label>
      </div>
      <div class="row">
        <label for="exercise">Exercise:</label>
        <select id="exercise" v-model="selectedExercise" @change="applySettings">
          <option v-for="exercise in exerciseProviders" :key="exercise.name" :value="exercise">{{ exercise.name }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.work_area {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
}

.stage {
  height: 100%;
  flex-grow: 1;
}

.control_panel {
  background-color: antiquewhite;
  height: 100%;
  padding: 0.5em;

  .title {
    font-weight: bold;
    margin-bottom: 1em;
  }

  .row {
    margin-top: 0.5em;

    label {
      margin-right: 0.5em;
    }
  }
}

</style>
