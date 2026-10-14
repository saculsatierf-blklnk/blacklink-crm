import { fabric } from "fabric";
import { useEffect } from "react";

interface UseCanvasEventsProps {
  save: () => void;
  canvas: fabric.Canvas | null;
  setSelectedObjects: (objects: fabric.Object[]) => void;
  clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  clearSelectionCallback,
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (canvas) {
      const handleAdded = () => save();
      const handleRemoved = () => save();
      const handleModified = () => save();

      const handleSelectionCreated = (e: any) => {
        setSelectedObjects(e.selected || []);
      };

      const handleSelectionUpdated = (e: any) => {
        setSelectedObjects(e.selected || []);
      };

      const handleSelectionCleared = () => {
        setSelectedObjects([]);
        clearSelectionCallback?.();
      };

      canvas.on("object:added", handleAdded);
      canvas.on("object:removed", handleRemoved);
      canvas.on("object:modified", handleModified);
      canvas.on("selection:created", handleSelectionCreated);
      canvas.on("selection:updated", handleSelectionUpdated);
      canvas.on("selection:cleared", handleSelectionCleared);

      return () => {
        canvas.off("object:added", handleAdded);
        canvas.off("object:removed", handleRemoved);
        canvas.off("object:modified", handleModified);
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:updated", handleSelectionUpdated);
        canvas.off("selection:cleared", handleSelectionCleared);
      };
    }
  }, [canvas, clearSelectionCallback, save, setSelectedObjects]);
};
