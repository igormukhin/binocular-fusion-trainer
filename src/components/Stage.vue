<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import Two from 'two.js'
import anime from 'animejs/lib/anime.es.js'

const stage = ref(null);
let two: Two;

onMounted(() => {
  two = new Two({ fitted: true }).appendTo(stage.value!!);
  const circle = two.makeCircle(20, 20, 10);
  circle.fill = '#FF8000';
  const circle2 = two.makeCircle(60, 20, 10);
  circle2.fill = '#00GG00';
  const group = two.makeGroup(circle, circle2);
  two.update();
  //console.log(group.renderer.domElement);

  const targets = document.getElementsByClassName('x');
  console.log(targets);
  anime({
    targets: group.position,
    x: 250,
    update: function() {
      two.update();
    }
  });
})

onBeforeUnmount(() => {
  two.clear();
});

</script>

<template>
  <div class="work_area">
    <div ref="stage" class="stage"></div>
    <div class="control_panel">
      <div class="title">Binocular Fusion Trainer</div>
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
