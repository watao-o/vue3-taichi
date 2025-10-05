<template>
  <v-list>
    <v-list-item v-for="(history, index) in diagnosisHistory" :key="index">
      <v-list-item-title>{{ history.date }}</v-list-item-title>
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

const editorStore = useEditorStore();

interface DiagnosisHistory {
  date: string;
  editor: JSONContent;
  html: string;
}

const diagnosisHistory = ref<DiagnosisHistory[]>([]);

// editorStore.editorData の変更を監視
watch(
  () => editorStore.editorData,
  (newData: JSONContent[]) => {
    try {
      diagnosisHistory.value = newData.map((data, index) => {
        return {
          date: `履歴 ${index + 1}`,
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
