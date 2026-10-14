import { fabric } from "fabric";

export function transformText(objects: any) {
  if (!objects) return;

  objects.forEach((item: any) => {
    if (item.objects) {
      transformText(item.objects);
    } else if (item.type === "text") {
      item.type = "textbox";
    }
  });
}

export function downloadFile(file: string, filename: string, type: string) {
  const anchorElement = document.createElement("a");
  anchorElement.href = file;
  anchorElement.download = `${filename}.${type}`;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  anchorElement.remove();
}

export function isTextType(type: string | undefined): boolean {
  return type === "text" || type === "i-text" || type === "textbox";
}

export const createFilter = (value: string) => {
  let effect: any = null;

  switch (value) {
    case "greyscale":
      effect = new fabric.Image.filters.Grayscale();
      break;
    case "polaroid":
      // @ts-ignore
      effect = new fabric.Image.filters.Polaroid ? new fabric.Image.filters.Polaroid() : new fabric.Image.filters.Sepia();
      break;
    case "sepia":
      effect = new fabric.Image.filters.Sepia();
      break;
    case "contrast":
      effect = new fabric.Image.filters.Contrast({ contrast: 0.25 });
      break;
    case "brightness":
      effect = new fabric.Image.filters.Brightness({ brightness: 0.15 });
      break;
    case "vintage":
      // @ts-ignore
      effect = new fabric.Image.filters.Vintage ? new fabric.Image.filters.Vintage() : new fabric.Image.filters.Sepia();
      break;
    case "pixelate":
      effect = new fabric.Image.filters.Pixelate({ blocksize: 6 });
      break;
    case "invert":
      effect = new fabric.Image.filters.Invert();
      break;
    case "blur":
      effect = new fabric.Image.filters.Blur({ blur: 0.2 });
      break;
    case "blacknwhite":
      // @ts-ignore
      effect = new fabric.Image.filters.BlackWhite ? new fabric.Image.filters.BlackWhite() : new fabric.Image.filters.Grayscale();
      break;
    default:
      effect = null;
      break;
  }

  return effect;
};
