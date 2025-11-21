<template>
  <v-list>
    <v-list-item v-for="(history, index) in diagnosisHistory" :key="index">
      <v-list-item-title class="d-flex justify-space-between align-center">
        <button
          type="button"
          class="text-primary text-decoration-underline"
          style="cursor: pointer"
          @click="onClickHistory(history)"
        >
          {{ history.date }}
        </button>
        <v-chip size="x-small" color="grey" variant="outlined" class="ml-2">
          {{ history.author || "Unknown" }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption text-grey mb-1">
        更新: {{ history.updatedAt || history.date }}
      </v-list-item-subtitle>
      <v-list-item-textarea>
        <div v-html="history.html"></div>
      </v-list-item-textarea>
      <v-btn
        size="small"
        variant="text"
        color="secondary"
        class="mt-1"
        @click="showDiff(history)"
      >
        <v-icon start size="small">mdi-file-compare</v-icon>
        差分を確認
      </v-btn>
    </v-list-item>
  </v-list>

  <!-- 差分表示ダイアログ -->
  <v-dialog v-model="diffDialog" max-width="800px">
    <v-card>
      <v-card-title class="bg-grey-lighten-3">
        変更履歴の差分
        <v-spacer></v-spacer>
        <v-btn icon size="small" @click="diffDialog = false"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>
      <v-card-text class="pa-4 diff-content">
        <div v-if="diffResult.length === 0">変更はありません</div>
        <div v-else>
          <span
            v-for="(part, i) in diffResult"
            :key="i"
            :class="{ 'diff-added': part.added, 'diff-removed': part.removed }"
          >
            {{ part.value }}
          </span>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { type JSONContent } from "@tiptap/vue-3";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import * as Diff from "diff";

import { useEditorStore } from "@/stores/editorStore";
import { getTodayJST } from "@/utils/DateUtils";
import type { DiagnosisHistory } from "@/types/DiagnosisHistory";

const editorStore = useEditorStore();

const diagnosisHistory = ref<DiagnosisHistory[]>([]);
const diffDialog = ref(false);
const diffResult = ref<Diff.Change[]>([]);

const emit = defineEmits<{
  (e: "clickHistory", editor: JSONContent): void;
}>();

const onClickHistory = (history: DiagnosisHistory) => {
  if (!history.editor) {
    return;
  }
  emit("clickHistory", history.editor);
};

const showDiff = (history: DiagnosisHistory) => {
  // 現在のエディタの内容と比較（簡易的にHTML文字列で比較）
  // 本来はプレーンテキスト化して比較するか、ProseMirrorのStepで比較するのが正確
  // ここではHTMLタグを除去したテキストで比較する簡易実装

  const currentEditorData =
    editorStore.editorData[editorStore.editorData.length - 1]; // 最新データを取得と仮定
  // 注: 実際には現在のTiptapエディタの内容を取得する必要があるが、
  // Historyコンポーネントからは直接アクセスできないため、
  // 比較対象を「一つ前の履歴」にするか、propで現在値をもらう必要がある。
  // ここでは「履歴のHTML」と「その一つ前の履歴のHTML」を比較するロジックにする

  const currentIndex = diagnosisHistory.value.findIndex((h) => h === history);
  const prevHistory = diagnosisHistory.value[currentIndex + 1]; // 新しい順なら次は古い履歴

  const currentText = stripHtml(history.html);
  const prevText = prevHistory ? stripHtml(prevHistory.html) : "";

  diffResult.value = Diff.diffChars(prevText, currentText);
  diffDialog.value = true;
};

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// editorStore.editorData の変更を監視
watch(
  () => editorStore.editorData,
  (newData: JSONContent[]) => {
    try {
      diagnosisHistory.value = newData.map((data, index) => {
        return {
          index: index,
          date: `${getTodayJST()}_${index + 1}`,
          editor: data,
          html: generateHTML(data, [StarterKit, Image]),
          author: "Dr. Taro", // モックデータ
          updatedAt: new Date().toLocaleString(), // モックデータ
        };
      });
    } catch (error) {
      console.error("Error initializing editor:", error);
    }
  },
  { deep: true } // 深い変更も監視
);
</script>

<style scoped>
.diff-added {
  background-color: #e6ffec;
  color: #24292e;
  text-decoration: none;
}
.diff-removed {
  background-color: #ffebe9;
  color: #24292e;
  text-decoration: line-through;
}
.diff-content {
  font-family: monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>
