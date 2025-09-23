<script setup lang="ts">
import Konva from "konva";

onMounted(() => {
  const stage = new Konva.Stage({
    container: "container", // HTMLのdiv要素のID
    width: 800,
    height: 800,
  });

  const layer = new Konva.Layer();
  stage.add(layer);

  // Stageの外枠を描画
  const borderRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    stroke: "black", // 黒い枠線
    strokeWidth: 2,
    listening: false, // イベントを無視
  });
  layer.add(borderRect);

  // SVG ファイルを読み込んで描画
  fetch("/svg-sample-1.svg")
    .then((response) => response.text())
    .then((svgString) => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");

      // SVG の <g> 要素をグループ化して Konva.Group に変換
      const groups = svgDoc.querySelectorAll("g");
      groups.forEach((group) => {
        const konvaGroup = new Konva.Group({
          draggable: true, // グループ全体をドラッグ可能にする
        });

        const paths = group.querySelectorAll("path");
        paths.forEach((path) => {
          const konvaPath = new Konva.Path({
            data: path.getAttribute("d") || "",
            stroke: path.getAttribute("stroke") || "black",
            strokeWidth: parseFloat(path.getAttribute("stroke-width") || "1"),
            fill: path.getAttribute("fill") || "none",
          });

          // グループに追加
          konvaGroup.add(konvaPath);
        });

        // レイヤーにグループを追加
        layer.add(konvaGroup);
      });

      layer.draw();
    })
    .catch((error) => {
      console.error("Error loading SVG:", error);
    });
});
</script>

<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<style scoped>
#container {
  display: block;
}
</style>
