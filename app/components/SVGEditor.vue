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

watch(canvasRef, async () => {
  const container = canvasRef.value?.parentElement;

  const resizeCanvas = () => {
    if (container && fabricCanvas.value) {
      fabricCanvas.value.setWidth(container.clientWidth);
      fabricCanvas.value.setHeight(container.clientHeight);
      fabricCanvas.value.renderAll();
    }
  };

  fabricCanvas.value = new fabric.Canvas(canvasRef.value, {
    selection: true,
    preserveObjectStacking: true,
  });
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
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

const addTextbox = () => {
  const textbox = new fabric.Textbox("テキストを入力", {
    left: 100,
    top: 100,
    width: 200,
    fontSize: 20,
    fill: "#000000",
    backgroundColor: "#ffffff",
    borderColor: "#000000",
    editable: true,
  });

  // Add event listeners for editing mode
  textbox.on("mousedblclick", () => {
    textbox.enterEditing();
    textbox.hiddenTextarea?.focus();
  });

  fabricCanvas.value?.add(textbox);
  fabricCanvas.value?.setActiveObject(textbox);
  textbox.enterEditing();
  fabricCanvas.value?.renderAll();
};
</script>

<template>
  <div class="canvas-container">
    <ClientOnly>
      <div class="canvas-wrapper">
        <canvas ref="canvasRef" class="canvas" />
      </div>
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
      <v-btn @click="addTextbox" color="blue">テキストボックス追加</v-btn>
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
  display: flex;
  flex-direction: column; /* 子要素を縦方向に並べる */
  justify-content: space-between; /* 上下の要素を均等に配置 */
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  width: 100%;
  height: 100vh;
  overflow: auto;
  gap: 16px; /* 子要素間のスペースを追加 */
}

.canvas-wrapper {
  border: 1px solid black;
  position: relative;
  width: 100%;
  height: 100%;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
</style>