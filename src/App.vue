<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import Two from 'two.js';
import {Controllable, EyeImages, Side, SidedShapes} from "./lib/Common.ts";
import {eyeImageFactories} from "./lib/EyeImages.ts";
import {CONVERGENCE_MASSAGE, exerciseProviders, INNER_MUSCLE_STRETCHING} from "./lib/Exercises.ts";
import {Shape} from "two.js/src/shape";
import {loadSettings, persistSettings, Settings} from "./lib/Settings.ts";
import {formatMinSecs, SecondsTicker} from "./lib/SecondsTicker.ts";

const stage = ref<any>(null);
const two = new Two({ fitted: true });

const shouldDrawCentralGuide = ref(true);
let sceneBackground: Shape;

const eyeGap = ref(320);

const eyeImageFactoryName = ref(eyeImageFactories[0].name);
const eyeImageFactory = computed(() => eyeImageFactories.find(factory => factory.name === eyeImageFactoryName.value)!!);
let eyeImages: EyeImages;
let eyeImagePlaceholders: SidedShapes;

const exerciseName = ref(exerciseProviders[0].name);
const exercise = computed(() => exerciseProviders.find(exercise => exercise.name === exerciseName.value)!!);
let currentExerciseAnimation: Controllable;

const elapsedSeconds = ref(0);
const secondsTicker = SecondsTicker.forRef(elapsedSeconds);

const imsMoveOut = ref(20);
const conmasMoveOut = ref(10);

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
    eyeImages.pause();
    Object.values(eyeImages.images).forEach(img => img.remove());
  }

  eyeImages = eyeImageFactory.value.make(two);
}

function applyEyeImagePositions() {
  if (eyeImagePlaceholders) {
    Object.values(eyeImagePlaceholders).forEach(eyeImagePlaceholder => eyeImagePlaceholder.remove());
  }

  eyeImagePlaceholders = {
    [Side.Left]: two.makeGroup(eyeImages.images[Side.Left]),
    [Side.Right]: two.makeGroup(eyeImages.images[Side.Right]),
  }

  eyeImagePlaceholders[Side.Left].position.set(two.width / 2 - (eyeGap.value / 2), two.height / 2);
  eyeImagePlaceholders[Side.Right].position.set(two.width / 2 + (eyeGap.value / 2), two.height / 2);
}

function applyExerciseAnimation() {
  if (currentExerciseAnimation) {
    currentExerciseAnimation.pause();
  }

  currentExerciseAnimation = exercise.value.animate(
      eyeImages.images, () => two.update(), snapshotSettings());
}

function applySettings() {
  applySceneBackground();
  applyEyeImages();
  applyEyeImagePositions();
  applyExerciseAnimation();
  persistSettings(snapshotSettings());
}

function snapshotSettings(): Settings {
  return {
    shouldDrawCentralGuide: shouldDrawCentralGuide.value,
    eyeGap: eyeGap.value,
    eyeImageFactoryName: eyeImageFactoryName.value,
    exerciseName: exerciseName.value,
    innerMuscleStretching: {
      moveOut: imsMoveOut.value,
    },
    convergenceMassage: {
      moveOut: conmasMoveOut.value,
    },
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

  if (settings.exerciseName != null
      && exerciseProviders.find(exercise => exercise.name === settings.exerciseName) != null) {
    exerciseName.value = settings.exerciseName;
  }

  imsMoveOut.value = settings.innerMuscleStretching?.moveOut ?? imsMoveOut.value;
  conmasMoveOut.value = settings.convergenceMassage?.moveOut ?? conmasMoveOut.value;
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
  secondsTicker.stop();
});

function onWindowResize() {
  const svg = two.renderer.domElement;
  const parent = svg.parentElement;
  two.renderer.setSize(parent.clientWidth, parent.clientHeight);
  applySettings();
}

function resetClock() {
  secondsTicker.restart();
  applySettings();
}

</script>

<template>
  <div class="work_area">
    <div ref="stage" class="stage"></div>

    <div class="control_panel">
      <div class="title">Binocular Fusion Trainer</div>

      <div class="row">
        <label for="eyeGap">Eye gap:</label>
        <input id="eyeGap" v-model="eyeGap" @change="applySettings" type="range" min="160" max="400" step="10" />
        <span>{{ eyeGap }}</span>
      </div>

      <div class="space"/>
      <div class="row">
        <div>Exercise:</div>

        <div v-for="(exercise, index) in exerciseProviders" :key="exercise.name">
          <input :id="'exercise_' + index" type="radio" name="exercise" v-model="exerciseName" :value="exercise.name" @change="applySettings">
          <label :for="'exercise_' + index">{{ exercise.name }}</label>
        </div>
      </div>

      <div v-if="exerciseName == INNER_MUSCLE_STRETCHING">
        <div class="space"/>
        <div class="row">
          <label for="imsMoveOut">Stretching distance:</label>
          <input id="imsMoveOut" v-model="imsMoveOut" @change="applySettings" type="range" min="10" max="60" step="5" />
          <span>{{ imsMoveOut }}</span>
        </div>
      </div>

      <div v-if="exerciseName == CONVERGENCE_MASSAGE">
        <div class="space"/>
        <div class="row">
          <label for="imsMoveOut">Stretching distance:</label>
          <input id="imsMoveOut" v-model="conmasMoveOut" @change="applySettings" type="range" min="5" max="100" step="5" />
          <span>{{ conmasMoveOut }}</span>
        </div>
      </div>

      <div class="space"/>
      <div class="row">
        <label for="eyeImage">Image:</label>
        <select id="eyeImage" v-model="eyeImageFactoryName" @change="applySettings">
          <option v-for="factory in eyeImageFactories" :key="factory.name" :value="factory.name">{{ factory.name }}</option>
        </select>
      </div>
      <div class="space"/>

      <div class="row">
        <input id="centralGuide" type="checkbox" v-model="shouldDrawCentralGuide" @change="applySettings">
        <label for="centralGuide" class="checkbox">Central guide</label>
      </div>
      <div class="space"/>

      <div class="row">
        Time elapsed: {{ formatMinSecs(elapsedSeconds) }} <button v-on:click="resetClock();">&#8634;</button>
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

  .space {
    height: 1em;
  }
}

</style>
