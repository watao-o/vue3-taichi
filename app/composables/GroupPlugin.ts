import * as fabric from "fabric";
import { v4 as uuid } from "uuid";

const isActiveSelection = (
  obj: fabric.Object | null | undefined
): obj is fabric.ActiveSelection => {
  return obj !== null && obj !== undefined && obj.type === "activeselection";
};

const isGroup = (
  obj: fabric.Object | null | undefined
): obj is fabric.Group => {
  return obj !== null && obj !== undefined && obj.type === "group";
};

export const useGroupPlugin = (canvas: Ref<fabric.Canvas | undefined>) => {
  const groupSelected = () => {
    if (!canvas.value) return;

    // 複数のオブジェクトを選択したときはActiveSelectionが生成される。
    const selectedObject = canvas.value.getActiveObject();
    if (!isActiveSelection(selectedObject)) return;

    // グループ化前のオブジェクトは、参照・絶対位置・スケールを保存して削除
    const activeObjects = canvas.value.getActiveObjects();
    const originalPositions = activeObjects.map((obj) => {
      return {
        obj,
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
      };
    });
    activeObjects.forEach((obj) => {
      canvas.value!.remove(obj);
    });

    // Group作成時、グループ内のオブジェクトの絶対位置やスケールが変更される
    const group = new fabric.Group(activeObjects, {
      interactive: false, // グループ全体として動作
      subTargetCheck: false, // グループ内オブジェクトの個別選択許可
    });
    // グループ化後のオブジェクトを参照し、元の位置とスケールを復元
    const groupId: string = uuid();
    originalPositions.forEach(({ obj, left, top, scaleX, scaleY }) => {
      obj.left = left;
      obj.top = top;
      obj.scaleX = scaleX;
      obj.scaleY = scaleY;
      obj.setCoords();
      obj.set("id", groupId);
    });
    canvas.value!.add(group);

    canvas.value!.renderAll();
  };

  // グループの解除（サイズと位置を完全に保持）
  const ungroupSelected = () => {
    if (!canvas.value) return;

    const activeGroup = canvas.value.getActiveObject();
    if (!isGroup(activeGroup)) return;

    activeGroup.getObjects().forEach((obj) => {
      obj.set("id", undefined);
    });

    canvas.value!.add(...activeGroup.removeAll());
    canvas.value!.remove(activeGroup);

    canvas.value!.renderAll();
  };

  return {
    groupSelected,
    ungroupSelected,
  };
};
