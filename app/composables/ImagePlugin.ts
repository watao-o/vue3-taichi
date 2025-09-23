import * as fabric from "fabric";

export const drawPng = async (canvas: fabric.Canvas, imgPath: string) => {
  const img = await fabric.Image.fromURL(imgPath);

  img.set({
    dirty: true,
    scaleX: 0.5,
    scaleY: 0.5,
    left: 50,
    top: 50,
    angle: 0,
    clipPath: new fabric.Circle({
      objectCaching: false,
      radius: 300,
      originX: "center",
      originY: "center",
    }),
  });
  canvas.add(img);
  canvas.setActiveObject(img);
};
