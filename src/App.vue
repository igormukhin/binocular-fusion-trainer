<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import Two from 'two.js';
import anime from 'animejs/lib/anime.es.js';
import {Controllable, Side, SidedShapes} from "./lib/Common.ts";
import {eyeImageFactories} from "./lib/EyeImages.ts";
import {exerciseProviders} from "./lib/Exercises.ts";
import {Shape} from "two.js/src/shape";
import {loadSettings, persistSettings, Settings} from "./lib/Settings.ts";

const stage = ref<any>(null);
const two = new Two({ fitted: true });

const shouldDrawCentralGuide = ref(true);
let sceneBackground: Shape;

const eyeGap = ref(320);

const eyeImageFactoryName = ref(eyeImageFactories[0].name);
const eyeImageFactory = computed(() => eyeImageFactories.find(factory => factory.name === eyeImageFactoryName.value)!!);
let eyeImages: SidedShapes;
let eyeImagePlaceholders: SidedShapes;

const shouldAnimateEyeImages = ref(true);
let currentEyeImageAnimation: Controllable;

const exerciseName = ref(exerciseProviders[0].name);
const exercise = computed(() => exerciseProviders.find(exercise => exercise.name === exerciseName.value)!!);
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

  eyeImages = eyeImageFactory.value.make(two);
}

function applyEyeImagePositions() {
  if (eyeImagePlaceholders) {
    Object.values(eyeImagePlaceholders).forEach(eyeImagePlaceholder => eyeImagePlaceholder.remove());
  }

  eyeImagePlaceholders = {
    [Side.Left]: two.makeGroup(eyeImages[Side.Left]),
    [Side.Right]: two.makeGroup(eyeImages[Side.Right]),
  }

  eyeImagePlaceholders[Side.Left].position.set(two.width / 2 - (eyeGap.value / 2), two.height / 2);
  eyeImagePlaceholders[Side.Right].position.set(two.width / 2 + (eyeGap.value / 2), two.height / 2);
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

  currentExerciseAnimation = exercise.value.animate(eyeImages, () => two.update());
}

function applySettings() {
  applySceneBackground();
  applyEyeImages();
  applyEyeImagePositions();
  applyEyeImageAnimation();
  applyExerciseAnimation();
  persistSettings(snapshotSettings());
}

function snapshotSettings() {
  return {
    shouldDrawCentralGuide: shouldDrawCentralGuide.value,
    eyeGap: eyeGap.value,
    eyeImageFactoryName: eyeImageFactoryName.value,
    shouldAnimateEyeImages: shouldAnimateEyeImages.value,
    exerciseName: exerciseName.value,
  };
}

function restoreSettings(settings: Settings | null) {
  if (settings == null) {
    return;
  }

  if (settings.shouldDrawCentralGuide != null) {
    shouldDrawCentralGuide.value = settings.shouldDrawCentralGuide;
  }

  if (settings.eyeGap != null) {
    eyeGap.value = settings.eyeGap;
  }

  if (settings.eyeImageFactoryName != null
      && eyeImageFactories.find(factory => factory.name === settings.eyeImageFactoryName) != null) {
    eyeImageFactoryName.value = settings.eyeImageFactoryName;
  }

  if (settings.shouldAnimateEyeImages != null) {
    shouldAnimateEyeImages.value = settings.shouldAnimateEyeImages;
  }

  if (settings.exerciseName != null
      && exerciseProviders.find(exercise => exercise.name === settings.exerciseName) != null) {
    exerciseName.value = settings.exerciseName;
  }
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize);
  two.appendTo(stage.value);

  restoreSettings(loadSettings())
  applySettings();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  two.clear();
});

function onWindowResize() {
  const svg = two.renderer.domElement;
  const parent = svg.parentElement;
  two.renderer.setSize(parent.clientWidth, parent.clientHeight);
  applySettings();
}

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
        <label for="eyeGap">Eye gap:</label>
        <input id="eyeGap" v-model="eyeGap" @change="applySettings" type="range" min="160" max="400" step="10" />
        <span>{{ eyeGap }}</span>
      </div>
      <div class="row">
        <label for="eyeImage">Image:</label>
        <select id="eyeImage" v-model="eyeImageFactoryName" @change="applySettings">
          <option v-for="factory in eyeImageFactories" :key="factory.name" :value="factory.name">{{ factory.name }}</option>
        </select>
      </div>
      <div class="row">
        <input id="animateEyeImages" type="checkbox" v-model="shouldAnimateEyeImages" @change="applySettings">
        <label for="animateEyeImages" class="checkbox">Animate images</label>
      </div>
      <div class="row">
        <label for="exercise">Exercise:</label>
        <select id="exercise" v-model="exerciseName" @change="applySettings">
          <option v-for="exercise in exerciseProviders" :key="exercise.name" :value="exercise.name">{{ exercise.name }}</option>
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
  overflow: hidden;
}

.control_panel {
  background-color: antiquewhite;
  height: 100%;
  padding: 0.5em;
  width: 20em;

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
