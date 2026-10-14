import { fabric } from "fabric";
import { useEffect } from "react";

interface UseHotkeysProps {
  canvas: fabric.Canvas | null;
  undo: () => void;
  redo: () => void;
  save: (skip?: boolean) => void;
  copy: () => void;
  paste: () => void;
}

export const useHotkeys = ({
  canvas,
  undo,
  redo,
  save,
  copy,
  paste,
}: UseHotkeysProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlKey = event.ctrlKey || event.metaKey;
      const isInput = ["INPUT", "TEXTAREA"].includes(
        (event.target as HTMLElement)?.tagName
      );

      // If user is editing inside a text box in fabric, don't trigger global delete
      // @ts-ignore
      const isEditingText = canvas?.getActiveObject()?.isEditing;

      if (isInput || isEditingText) return;

      // Delete / Backspace
      if (event.key === "Delete" || event.key === "Backspace") {
        const activeObjects = canvas?.getActiveObjects();
        if (activeObjects && activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            if (obj.name !== "clip") {
              canvas?.remove(obj);
            }
          });
          canvas?.discardActiveObject();
          canvas?.renderAll();
        }
      }

      if (isCtrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (isCtrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }

      if (isCtrlKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copy();
      }

      if (isCtrlKey && event.key.toLowerCase() === "v") {
        event.preventDefault();
        paste();
      }

      if (isCtrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        save(true);
      }

      if (isCtrlKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        canvas?.discardActiveObject();
        const selectable = canvas
          ?.getObjects()
          .filter((obj) => obj.name !== "clip" && obj.selectable);
        if (selectable && selectable.length > 0) {
          canvas?.setActiveObject(
            new fabric.ActiveSelection(selectable, { canvas })
          );
          canvas?.renderAll();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas, copy, paste, redo, save, undo]);
};
