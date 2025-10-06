<template>
  <div class="mx-auto p-4 sm:p-6 bg-gray-100 min-h-screen">
    <div class="bg-white shadow-md rounded-lg p-4 sm:p-6">
      <div class="flex flex-wrap gap-4 mb-4">
        <v-btn @click="dialog = true" color="blue"> Open SVG Editor </v-btn>
        <v-btn @click="downloadSVG" :disabled="!svgData" color="blue">
          Download SVG
        </v-btn>
        <v-btn @click="exportEditor" color="blue"> Export Data </v-btn>
      </div>
      <v-dialog v-model="dialog">
        <SVGEditor @export-svg="insertSVGAsImage" />
      </v-dialog>
      <editor-content
        :editor="editor"
        class="border border-gray-300 rounded p-4 sm:p-6 bg-gray-50"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent, type JSONContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import SVGEditor from "./SVGEditor.vue";

const dialog = ref(false);
const svgData = ref<string | null>(null); // SVGデータを保存するためのref

const editor = useEditor({
  content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
  extensions: [StarterKit, Image],
});
const editorStore = useEditorStore();

const insertSVGAsImage = (svg: string) => {
  svgData.value = svg; // SVGデータを保存

  const bytes = new TextEncoder().encode(svg);
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");
  editor
    .value!.chain()
    .focus()
    .setImage({
      src: `data:image/svg+xml;base64,${btoa(binString)}`,
    })
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

const exportEditor = () => {
  const data = editor.value!.getJSON() as JSONContent;
  editorStore.setEditorData(data);
};

// 履歴からのインポート用関数
const importEditor = (data: JSONContent) => {
  editor.value!.commands.setContent(data);
};

defineExpose({ importEditor });

</script>

<style scoped></style>
