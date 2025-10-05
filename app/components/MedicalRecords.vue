<script setup>
import { ref, onMounted } from "vue";
import Canvas from "~/components/Canvas.vue";
import Tiptap from "~/components/Tiptap.vue";
import History from "~/components/History.vue";

// リアクティブな状態
const count = ref(0);

const diagnosisResults = ref([
  { label: "血圧", content: "140/111 mmHg" },
  { label: "身長", content: "175.0cm" },
  { label: "体重", content: "86.0kg" },
  { label: "体温", content: "36.5℃" },
]);

const diagnosisHistory = ref([
  {
    date: "2025-09-01",
    summary: "血圧: 130/90, 体温: 36.4℃",
    content: "過去の診療内容1",
  },
  {
    date: "2025-08-15",
    summary: "血圧: 128/85, 体温: 36.3℃",
    content: "過去の診療内容2",
  },
]);

const historyData = ref(null);

const handleExportData = (data) => {
  historyData.value = data;
};

// 状態を変更し、更新をトリガーする関数。
onMounted(() => {});
</script>

<template>
  <v-card class="p-4 m-4 bg-blue-accent-1 text-black" outlined>
    <v-card-title class="text-h5 bg-grey-lighten-1 text-white elevation-3">
      <v-row>
        <v-col cols="12" md="6" class="border-e">
          【H29 1.9】15.55医師 太郎(内科)
        </v-col>
        <v-col cols="12" md="6"> (再診)院外処方＜社保本＞ </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="bg-white text-black elevation-2">
      <v-row>
        <v-col cols="12" lg="6" class="border-e mb-4 lg:mb-0">
          <p class="text-lg font-bold mb-2">診療履歴一覧</p>
          <History />
        </v-col>
        <v-col cols="12" lg="6">
          <p class="text-lg font-bold mb-2">SOAPエディタ</p>
          <Tiptap @export-data="handleExportData" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
