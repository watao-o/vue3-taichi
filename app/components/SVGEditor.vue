<script setup lang="ts">
import * as fabric from "fabric";
import { v4 as uuid } from "uuid";

const emit = defineEmits(["export-svg"]);
const canvasRef = ref<HTMLCanvasElement>();
const fabricCanvas = ref<fabric.Canvas>();
const { startDraw, endDraw } = useFreeDrawPlugin(fabricCanvas);
const { groupSelected, ungroupSelected } = useGroupPlugin(fabricCanvas);
const uploadInputRef = ref<HTMLInputElement | null>(null);
const uploadInputRef2 = ref<HTMLInputElement | null>(null);

watch(canvasRef, () => {
  fabricCanvas.value = new fabric.Canvas(canvasRef.value, {
    selection: true, // 複数選択を有効
    preserveObjectStacking: true, // オブジェクトの重なり順を保持
  });
});

const exportCanvasToSVG = () => {
  if (fabricCanvas.value) {
    const svgData = fabricCanvas.value.toSVG();
    // SVGデータを親コンポーネントに渡す
    emit("export-svg", svgData);
  }
};

const uploadTemplate = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    fabricCanvas.value!.clear();
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = (e) => {
      const svgString = e.target?.result as string;

      fabric.loadSVGFromString(svgString).then((res) => {
        const validObjects = res.objects.filter(
          (obj): obj is fabric.FabricObject => obj !== null
        );

        validObjects.forEach((obj) => {
          obj.set({ id: "template_id" }); // エスケープ不要な固定ID
        });
        const group = fabric.util.groupSVGElements(validObjects, res.options);
        group.set({
          selectable: false, // 選択不可
          evented: false, // ユーザー操作を無効化
        });
        fabricCanvas.value!.add(group);
        fabricCanvas.value!.renderAll();
      });
    };
  }
  input.value = ""; // 同じファイルを再度選択できるようにする
};

const uploadSVGToCanvas = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    fabricCanvas.value!.clear();
    reader.readAsText(file);

    reader.onload = (e) => {
      const svgString = e.target?.result as string;

      fabric.loadSVGFromString(svgString).then((res) => {
        const objectsByUUID = res.objects
          .filter((obj): obj is fabric.FabricObject => obj !== null)
          .reduce((acc, obj) => {
            const id = obj?.get("id") || uuid();
            if (!acc[id]) {
              acc[id] = [];
            }
            acc[id].push(obj);
            return acc;
          }, {} as Record<string, fabric.FabricObject[]>);

        Object.entries(objectsByUUID).forEach(([id, groupObjects]) => {
          const group = fabric.util.groupSVGElements(groupObjects, res.options);
          if (id === "template_id") {
            group.set({
              selectable: false, // 選択不可
              evented: false, // ユーザー操作を無効化
            });
          }
          fabricCanvas.value!.add(group);
        });
        fabricCanvas.value!.renderAll();
      });
    };
  }
  input.value = ""; // 同じファイルを再度選択できるようにする
};

const deleteSelectedObject = () => {
  const activeObject = fabricCanvas.value?.getActiveObject();
  if (activeObject) {
    fabricCanvas.value?.remove(activeObject);
    fabricCanvas.value?.renderAll();
  }
};
</script>

<template>
  <div class="canvas-container">
    <ClientOnly>
      <canvas ref="canvasRef" width="800" height="600" class="fabric-canvas" />
    </ClientOnly>

    <div class="control-buttons">
      <v-btn color="black" @click="startDraw({ width: 5, color: '#000000' })">
        お絵描き開始
      </v-btn>
      <v-btn color="black" @click="endDraw"> お絵描き終了</v-btn>
      <v-btn color="black" @click="deleteSelectedObject"
        >選択オブジェクト削除</v-btn
      >
      <v-btn @click="groupSelected" color="blue">グループ化</v-btn>
      <v-btn @click="ungroupSelected" color="blue">グループ解除</v-btn>
      <v-btn color="green" @click="uploadInputRef?.click()">Template入力</v-btn>
      <v-btn color="green" @click="uploadInputRef2?.click()">Do入力</v-btn>
      <input
        type="file"
        accept="image/svg+xml"
        @change="uploadSVGToCanvas"
        ref="uploadInputRef2"
        style="display: none"
      />
      <v-btn @click="exportCanvasToSVG" color="red">SVGエクスポート</v-btn>
      <input
        type="file"
        accept="image/svg+xml"
        @change="uploadTemplate"
        ref="uploadInputRef"
        style="display: none"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  gap: 16px;
}

.control-buttons {
  display: flex;
  gap: 8px;
}
</style>
