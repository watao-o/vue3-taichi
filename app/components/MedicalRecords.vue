<script setup>
import { ref, onMounted } from "vue";
import Canvas from "~/components/Canvas.vue";
import Tiptap from "~/components/Tiptap.vue";

// リアクティブな状態
const count = ref(0);

const diagnosisResults = ref([
  { label: "血圧", content: "140/111 mmHg" },
  { label: "身長", content: "175.0cm" },
  { label: "体重", content: "86.0kg" },
  { label: "体温", content: "36.5℃" },
]);

// 状態を変更し、更新をトリガーする関数。
onMounted(() => {});
</script>

<template>
  <v-card class="pa-3 ma-3 bg-blue-accent-1 text-black" outlined>
    <v-card-title class="text-h5 bg-grey-lighten-1 text-white elevation-3">
      <v-row>
        <v-col cols="6" class="border-e">
          【H29 1.9】15.55医師 太郎(内科)
        </v-col>
        <v-col cols="6"> (再診)院外処方＜社保本＞ </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="bg-white text-black elevation-2">
      <v-row>
        <v-col cols="6" class="border-e">
          <v-row
            v-for="result in diagnosisResults"
            :key="result.label"
            class="my-0"
          >
            <v-col cols="2" class="py-0">{{ result.label }}：</v-col>
            <v-col cols="auto" class="py-0">{{ result.content }}</v-col>
          </v-row>
          <Canvas />
        </v-col>
        <v-col cols="6">
          <p>【処方箋の情報をここに表示】</p>
          <tiptap />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
