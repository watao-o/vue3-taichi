<template>
  <div class="container">
    <div class="editor-container">
      <div class="control-buttons">
        <v-btn @click="dialog = true" color="blue">Open SVG Editor</v-btn>
        <v-btn @click="downloadSVG" color="green" :disabled="!svgData"
          >Download SVG</v-btn
        >
      </div>
      <v-dialog v-model="dialog" max-width="1500">
        <template #default>
          <SVGEditor @export-svg="insertSVGAsImage" />
        </template>
      </v-dialog>
      <editor-content :editor="editor" class="editor-content" />
    </div>
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Image from "@tiptap/extension-image";
import SVGEditor from "./SVGEditor.vue";

const dialog = ref(false);
const svgData = ref(null); // SVGデータを保存するためのref

const editor = useEditor({
  content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
  extensions: [StarterKit, Document, Image],
});

const insertSVGAsImage = (svg) => {
  svgData.value = svg; // SVGデータを保存
  editor.value
    .chain()
    .focus()
    .setImage({ src: `data:image/svg+xml;base64,${btoa(svg)}` })
    .run();
  dialog.value = false; // モーダルを閉じる
};

const downloadSVG = () => {
  if (!svgData.value) return;
  const blob = new Blob([svgData.value], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "image-node.svg";
  link.click();
};
</script>

<style scoped>
.container {
  background-color: #c43a3aa2; /* 背景色を薄いグレーに設定 */
}
.editor-container {
  width: 100vw; /* 横幅をブラウザ画面全体に設定 */
  height: 100vh; /* 縦幅をブラウザ画面全体に設定 */
  border: 1px solid #ddd; /* 境界線を追加 */
  border-radius: 8px;
  background-color: #52c595; /* 背景色 */
  padding: 16px; /* 内側の余白を追加 */
  overflow: auto; /* コンテンツがはみ出した場合にスクロール可能にする */
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.editor-content {
  min-height: 100%; /* エディタの高さをコンテナに合わせる */
  padding: 8px; /* 入力箇所に余白を追加 */
  background-color: #fff; /* 入力エリアの背景色を白に設定 */
  border-radius: 4px; /* 入力エリアの角を丸くする */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 入力エリアに影を追加 */
}
</style>
