<script setup>
import { ref, onMounted } from "vue";
import { useTheme } from "vuetify";
import Canvas from "~/components/Canvas.vue";
import Tiptap from "~/components/Tiptap.vue";
import History from "~/components/History.vue";
import SVGEditor from "~/components/SVGEditor.vue";

const theme = useTheme();
const tiptapRef = ref();
const isSaved = ref(false);
const rightTab = ref("info"); // 右ペインのタブ状態
const showSchemaEditor = ref(false); // シェーマエディタの表示状態

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
};

const saveRecord = () => {
  // 保存処理のモック
  isSaved.value = true;
  setTimeout(() => {
    isSaved.value = false;
  }, 2000);
};

const printRecord = () => {
  window.print();
};

const insertTemplate = (text) => {
  tiptapRef.value?.insertContent(text);
};

const openSchemaEditor = () => {
  showSchemaEditor.value = true;
};

const handleSchemaExport = (svgData) => {
  // SVGデータを画像としてエディタに挿入
  // Tiptapコンポーネント側で画像挿入ロジックを公開する必要があるが、
  // ここでは簡易的にHTMLとして挿入するか、Tiptap側のメソッドを呼び出す
  // Tiptap.vue に insertSVGAsImage 相当の機能があればそれを呼ぶのがベスト
  // 今回は insertContent で img タグを挿入する形をとる（Base64変換が必要）

  const bytes = new TextEncoder().encode(svgData);
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");
  const base64 = btoa(binString);
  const imgTag = `<img src="data:image/svg+xml;base64,${base64}" />`;

  tiptapRef.value?.insertContent(imgTag);
  showSchemaEditor.value = false;
};

const diagnosisResults = ref([
  { label: "血圧", content: "140/111 mmHg" },
  { label: "身長", content: "175.0cm" },
  { label: "体重", content: "86.0kg" },
  { label: "体温", content: "36.5℃" },
]);

const templates = ref([
  {
    title: "風邪症状",
    content:
      "主訴：発熱、咽頭痛\n所見：咽頭発赤あり、扁桃腫大なし\n処方：PL顆粒、ロキソニン",
  },
  {
    title: "高血圧定期",
    content: "主訴：変わりなし\n血圧：安定\n処方：アムロジピン5mg 30日分",
  },
  {
    title: "インフルエンザ疑い",
    content:
      "主訴：高熱、関節痛\n検査：インフルエンザ抗原迅速検査（－）\n処方：麻黄湯",
  },
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

const handleHistoryClick = (editorData) => {
  tiptapRef.value?.importEditor(editorData);
};

const handleExportData = (data) => {
  historyData.value = data;
};

// 状態を変更し、更新をトリガーする関数。
onMounted(() => {});
</script>

<template>
  <v-container fluid class="fill-height pa-0 bg-grey-lighten-4">
    <!-- ヘッダー部分 -->
    <v-app-bar color="primary" density="compact" elevation="2">
      <v-app-bar-title>
        <span class="text-subtitle-1 font-weight-bold">
          【H29 1.9】15.55 医師 太郎(内科) - (再診)院外処方＜社保本＞
        </span>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-chip
        :color="isSaved ? 'success' : 'warning'"
        class="mr-4"
        size="small"
        variant="elevated"
      >
        {{ isSaved ? "保存済み" : "未保存" }}
      </v-chip>
      <v-btn icon="mdi-printer" @click="printRecord" class="mr-2"></v-btn>
      <v-btn icon="mdi-theme-light-dark" @click="toggleTheme"></v-btn>
    </v-app-bar>

    <v-row no-gutters class="fill-height mt-12">
      <!-- 左ペイン: 診療履歴 -->
      <v-col cols="12" md="3" lg="2" class="d-flex flex-column border-e">
        <v-card flat class="fill-height d-flex flex-column rounded-0">
          <v-card-title class="text-subtitle-2 bg-grey-lighten-3 py-2">
            <v-icon start size="small">mdi-history</v-icon>
            診療履歴
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="flex-grow-1 pa-0 overflow-y-auto">
            <History @clickHistory="handleHistoryClick" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 中央ペイン: SOAPエディタ -->
      <v-col cols="12" md="6" lg="7" class="d-flex flex-column">
        <v-card flat class="fill-height d-flex flex-column rounded-0">
          <v-card-title
            class="text-subtitle-2 bg-grey-lighten-3 py-2 d-flex justify-space-between align-center"
          >
            <div>
              <v-icon start size="small">mdi-pencil</v-icon>
              SOAPエディタ
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="flex-grow-1 pa-4 overflow-y-auto">
            <Tiptap ref="tiptapRef" @export-data="handleExportData" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 右ペイン: 補助ツール -->
      <v-col cols="12" md="3" lg="3" class="d-flex flex-column border-s">
        <v-card flat class="fill-height d-flex flex-column rounded-0">
          <v-tabs
            v-model="rightTab"
            density="compact"
            grow
            bg-color="grey-lighten-3"
          >
            <v-tab value="info" class="text-caption">情報</v-tab>
            <v-tab value="template" class="text-caption">定型文</v-tab>
          </v-tabs>
          <v-divider></v-divider>

          <v-window v-model="rightTab" class="flex-grow-1 overflow-y-auto">
            <v-window-item value="info" class="pa-2">
              <!-- バイタル情報など -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title
                  class="text-caption font-weight-bold bg-grey-lighten-4 py-1"
                >
                  バイタルサイン
                </v-card-title>
                <v-divider></v-divider>
                <v-list density="compact">
                  <v-list-item v-for="(item, i) in diagnosisResults" :key="i">
                    <template v-slot:prepend>
                      <span class="text-caption text-medium-emphasis mr-2"
                        >{{ item.label }}:</span
                      >
                    </template>
                    <v-list-item-title class="text-body-2">{{
                      item.content
                    }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- シェーマ描画ボタン（プレースホルダー） -->
              <v-btn
                block
                variant="tonal"
                color="primary"
                class="mb-2"
                prepend-icon="mdi-draw"
                @click="openSchemaEditor"
              >
                シェーマ描画
              </v-btn>
              <v-btn
                block
                variant="tonal"
                color="secondary"
                class="mb-2"
                prepend-icon="mdi-pill"
              >
                処方セット参照
              </v-btn>
            </v-window-item>

            <v-window-item value="template" class="pa-2">
              <v-list lines="two" density="compact">
                <v-list-item
                  v-for="(tpl, i) in templates"
                  :key="i"
                  @click="insertTemplate(tpl.content)"
                  class="mb-2 border rounded"
                  link
                >
                  <v-list-item-title
                    class="text-subtitle-2 font-weight-bold text-primary"
                  >
                    {{ tpl.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption text-truncate">
                    {{ tpl.content }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-icon size="small" color="grey"
                      >mdi-plus-circle-outline</v-icon
                    >
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- シェーマエディタダイアログ -->
    <v-dialog
      v-model="showSchemaEditor"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showSchemaEditor = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>シェーマエディタ</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <SVGEditor @export-svg="handleSchemaExport" />
      </v-card>
    </v-dialog>

    <!-- フローティングアクションボタン -->
    <v-fab
      icon="mdi-content-save"
      color="primary"
      location="bottom right"
      position="fixed"
      class="mb-4 mr-4"
      size="large"
      elevation="4"
      app
      @click="saveRecord"
    ></v-fab>
  </v-container>
</template>

<style scoped>
@media print {
  /* 印刷時に不要な要素を非表示 */
  .v-app-bar,
  .v-fab,
  .v-btn,
  .v-tabs,
  .v-navigation-drawer {
    display: none !important;
  }

  /* 印刷時のレイアウト調整 */
  .v-container {
    display: block !important;
    height: auto !important;
    background: white !important;
  }

  .v-row {
    display: block !important;
  }

  .v-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
    border: none !important;
  }

  /* カードのスタイル調整 */
  .v-card {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
    margin-bottom: 20px !important;
    height: auto !important;
  }

  .v-card-text {
    overflow: visible !important;
    height: auto !important;
  }

  /* スクロールバーを消す */
  ::-webkit-scrollbar {
    display: none;
  }
}
</style>
