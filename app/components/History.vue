<template>
  <v-list>
    <v-list-item v-for="(history, index) in diagnosisHistory" :key="index">
      <v-list-item-title
        class="text-primary text-decoration-underline"
        style="cursor:pointer"
        @click="onClickHistory(history)"
      >
        {{ history.date }}
      </v-list-item-title>
      <v-list-item-textarea>
        <div v-html="history.html"></div>
      </v-list-item-textarea>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { type JSONContent } from "@tiptap/vue-3";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

import { useEditorStore } from "@/stores/editorStore";
import { getTodayJST } from "@/utils/DateUtils";
import type { DiagnosisHistory } from "@/types/DiagnosisHistory";

const editorStore = useEditorStore();

const diagnosisHistory = ref<DiagnosisHistory[]>([]);

const emit = defineEmits<{
  (e: 'clickHistory', history: DiagnosisHistory): void
}>();

const onClickHistory = (history: DiagnosisHistory) => {
  if (!history.editor) {
    return;
  }
  emit("clickHistory", history);
};
// editorStore.editorData の変更を監視
watch(
  () => editorStore.editorData,
  (newData: JSONContent[]) => {
    try {
      diagnosisHistory.value = newData.map((data, index) => {
        return {
          index: index,
          date: `${getTodayJST()}_${index + 1 }`,
          editor: data,
          html: generateHTML(data, [StarterKit, Image]),
        };
      });
    } catch (error) {
      console.error("Error initializing editor:", error);
    }
  },
  { deep: true } // 深い変更も監視
);
</script>
