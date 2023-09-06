<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';
import Two from 'two.js';
import anime from 'animejs/lib/anime.es.js';
import {Controllable, Side, SidedShapes} from "./lib/Common.ts";
import {eyeImageFactories} from "./lib/EyeImages.ts";
import {exerciseProviders} from "./lib/Exercises.ts";

const stage = ref(null);
const two = new Two({ fitted: true });

const selectedEyeImageFactory = ref(eyeImageFactories[0]);
let eyeImages: SidedShapes;
let eyeImagePlaceholders: SidedShapes;

const shouldAnimateEyeImages = ref(true);
let currentEyeImageAnimation: Controllable;

const selectedExercise = ref(exerciseProviders[0]);
let currentExerciseAnimation: Controllable;

function applyEyeImages() {
  if (eyeImages) {
    Object.values(eyeImages).forEach(eyeImage => eyeImage.remove());
  }

  eyeImages = selectedEyeImageFactory.value.make(two);
}

function applyEyeImagePositions() {
  const eyeGap = 200;

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

      <div>
        <label for="eyeImage">Image:</label>
        <select id="eyeImage" v-model="selectedEyeImageFactory" @change="applySettings">
          <option v-for="factory in eyeImageFactories" :key="factory.name" :value="factory">{{ factory.name }}</option>
        </select>
      </div>
      <div>
        <input id="animateEyeImages" type="checkbox" v-model="shouldAnimateEyeImages" @change="applySettings">
        <label for="animateEyeImages">Animate images</label>
      </div>
      <div>
        <label for="exercise">Exercise:</label>
        <select id="exercise" v-model="selectedExercise" @change="applySettings">
          <option v-for="exercise in exerciseProviders" :key="exercise.name" :value="exercise">{{ exercise.name }}</option>
        </select>
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
