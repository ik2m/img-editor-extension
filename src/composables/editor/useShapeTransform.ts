import type { Ref } from 'vue';
import type { Shape } from '@/components/editor/types';
import { isRectShape, isArrowShape, isDrawingShape, isTextShape } from '@/components/editor/types';
import Konva from 'konva';

/**
 * Konvaのトランスフォームイベントを処理するcomposable
 */
export function useShapeTransform(
  shapes: Ref<Shape[]>,
  selectedShapeId: Ref<string>
) {
  const handleTransformEnd = (e: any) => {
    const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
    if (!shape) return;

    if (isRectShape(shape)) {
      shape.x = e.target.x();
      shape.y = e.target.y();
    } else if (isArrowShape(shape)) {
      const node = e.target;
      const newPoints = node.points();
      shape.points = newPoints as [number, number, number, number];
    } else if (isDrawingShape(shape)) {
      const node = e.target;
      const newPoints = node.points();
      shape.points = newPoints;
    } else if (isTextShape(shape)) {
      shape.x = e.target.x();
      shape.y = e.target.y();
    }
  };

  return {
    handleTransformEnd,
  };
}
