<script setup>
import * as fabric from "fabric";
import { FabricImage } from "fabric";
import { drawPng } from "../composables/ImagePlugin";

const testRect = ref(
  new fabric.Rect({
    left: 50,
    top: 50,
    fill: "black",
    width: 30,
    height: 30,
  })
);
const testCircle = ref(
  new fabric.Circle({
    left: 100,
    top: 100,
    fill: "red",
    radius: 20,
  })
);

const canvas = ref(null);

onMounted(() => {
  const myCanvas = new fabric.Canvas("myCanvas");
  myCanvas.add(testRect.value);
  myCanvas.add(testCircle.value);

  drawPng(myCanvas, "https://vuejs.org/images/logo.png");

  myCanvas.isDrawingMode = false;

  canvas.value = myCanvas;
});
</script>

<template>
  <canvas
    id="myCanvas"
    width="auto"
    height="300"
    class="canvas-border"
  ></canvas>
</template>

<style scoped>
.canvas-border {
  border: 2px solid black;
}
</style>
