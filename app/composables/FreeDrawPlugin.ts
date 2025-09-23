import * as fabric from "fabric";

type DrawOptions = {
  width?: number;
  color?: string;
};

export const useFreeDrawPlugin = (canvas: Ref<fabric.Canvas | undefined>) => {
  const startDraw = (options: DrawOptions) => {
    if (!canvas.value) return;
    canvas.value.isDrawingMode = true;
    canvas.value.freeDrawingBrush = new fabric.PencilBrush(canvas.value);
    canvas.value.freeDrawingBrush.width = options.width || 5;
    canvas.value.freeDrawingBrush.color = options.color || "black";
  };

  const endDraw = () => {
    if (!canvas.value) return;
    canvas.value.isDrawingMode = false;
  };

  return {
    startDraw,
    endDraw,
  };
};
