import { defineStore } from "pinia";
import { type JSONContent } from "@tiptap/vue-3";

export const useEditorStore = defineStore("editor", {
  state: () => ({
    editorData: [] as JSONContent[], // TiptapエディタのJSONデータを複数保存
  }),
  actions: {
    setEditorData(data: JSONContent) {
      this.editorData.push(data); // データを配列に追加
    },
    updateEditorData(index: number, data: JSONContent) {
      if (index >= 0 && index < this.editorData.length) {
        this.editorData[index] = data; // 指定されたインデックスのデータを更新
      }
    },
    clearEditorData() {
      this.editorData = []; // データをクリア
    },
  },
});
