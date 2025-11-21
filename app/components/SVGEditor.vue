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
  textbox.hiddenTextarea?.focus();
  fabricCanvas.value?.renderAll();
};

const addArrow = () => {
  const arrowPath = "M 0 0 L 100 0 L 90 -10 M 100 0 L 90 10";
  const arrow = new fabric.Path(arrowPath, {
    left: 100,
    top: 100,
    stroke: "red",
    strokeWidth: 3,
    fill: "transparent",
    objectCaching: false,
  });
  fabricCanvas.value?.add(arrow);
  fabricCanvas.value?.renderAll();
};

const loadSchema = (type: "body" | "hand" | "head") => {
  let svgString = "";
  if (type === "body") {
    // Simple body outline placeholder
    svgString = `<svg width="200" height="400" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="50" r="30" stroke="black" stroke-width="2" fill="none"/>
      <line x1="100" y1="80" x2="100" y2="200" stroke="black" stroke-width="2"/>
      <line x1="100" y1="100" x2="50" y2="150" stroke="black" stroke-width="2"/>
      <line x1="100" y1="100" x2="150" y2="150" stroke="black" stroke-width="2"/>
      <line x1="100" y1="200" x2="70" y2="300" stroke="black" stroke-width="2"/>
      <line x1="100" y1="200" x2="130" y2="300" stroke="black" stroke-width="2"/>
    </svg>`;
  } else if (type === "hand") {
    // Simple hand outline placeholder
    svgString = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="100" width="100" height="80" rx="10" stroke="black" stroke-width="2" fill="none"/>
      <line x1="60" y1="100" x2="60" y2="50" stroke="black" stroke-width="2"/>
      <line x1="80" y1="100" x2="80" y2="30" stroke="black" stroke-width="2"/>
      <line x1="100" y1="100" x2="100" y2="20" stroke="black" stroke-width="2"/>
      <line x1="120" y1="100" x2="120" y2="40" stroke="black" stroke-width="2"/>
      <line x1="140" y1="100" x2="160" y2="80" stroke="black" stroke-width="2"/>
    </svg>`;
  } else if (type === "head") {
    // Simple head outline placeholder
    svgString = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="100" rx="60" ry="80" stroke="black" stroke-width="2" fill="none"/>
      <circle cx="80" cy="90" r="5" fill="black"/>
      <circle cx="120" cy="90" r="5" fill="black"/>
      <path d="M 90 110 Q 100 120 110 110" stroke="black" stroke-width="2" fill="none"/>
      <path d="M 80 140 Q 100 160 120 140" stroke="black" stroke-width="2" fill="none"/>
    </svg>`;
  }

  fabric.loadSVGFromString(svgString).then((res) => {
    const validObjects = res.objects.filter(
      (obj): obj is fabric.FabricObject => obj !== null
    );
    const group = fabric.util.groupSVGElements(validObjects, res.options);
    group.set({
      selectable: false,
      evented: false,
      id: "template_id",
      left: 50,
      top: 50,
    });
    fabricCanvas.value?.clear();
    fabricCanvas.value?.add(group);
    fabricCanvas.value?.renderAll();
  });
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
      <v-btn @click="addArrow" color="blue">矢印追加</v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn color="purple" v-bind="props">シェーマ読込</v-btn>
        </template>
        <v-list>
          <v-list-item @click="loadSchema('body')">
            <v-list-item-title>全身</v-list-item-title>
          </v-list-item>
          <v-list-item @click="loadSchema('hand')">
            <v-list-item-title>手</v-list-item-title>
          </v-list-item>
          <v-list-item @click="loadSchema('head')">
            <v-list-item-title>頭部</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

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
