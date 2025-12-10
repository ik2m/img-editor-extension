import { ref } from 'vue';
import type { Shape } from '@/components/editor/types';
import { isDrawingShape } from '@/components/editor/types';

/**
 * レイヤー（Shape配列）の管理を行うcomposable
 */
export function useLayerManagement() {
  const shapes = ref<Shape[]>([]);
  const selectedShapeId = ref('');

  const selectLayer = (id: string) => {
    selectedShapeId.value = id;
  };

  const moveLayerUp = (id: string) => {
    // お絵描きレイヤーは移動不可
    const shape = shapes.value.find((s) => s.id === id);
    if (shape && isDrawingShape(shape)) return;

    const index = shapes.value.findIndex((s) => s.id === id);
    if (index < shapes.value.length - 1) {
      // 移動先がお絵描きレイヤーの場合はスキップ
      const nextShape = shapes.value[index + 1];
      if (isDrawingShape(nextShape)) return;

      [shapes.value[index], shapes.value[index + 1]] = [
        shapes.value[index + 1],
        shapes.value[index],
      ];
    }
  };

  const moveLayerDown = (id: string) => {
    // お絵描きレイヤーは移動不可
    const shape = shapes.value.find((s) => s.id === id);
    if (shape && isDrawingShape(shape)) return;

    const index = shapes.value.findIndex((s) => s.id === id);
    if (index > 0) {
      // 移動先がお絵描きレイヤーの場合はスキップ
      const prevShape = shapes.value[index - 1];
      if (isDrawingShape(prevShape)) return;

      [shapes.value[index], shapes.value[index - 1]] = [
        shapes.value[index - 1],
        shapes.value[index],
      ];
    }
  };

  const deleteLayer = (id: string) => {
    // お絵描きレイヤーは削除不可
    const shape = shapes.value.find((s) => s.id === id);
    if (shape && isDrawingShape(shape)) return;

    const index = shapes.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      shapes.value.splice(index, 1);
      if (selectedShapeId.value === id) {
        selectedShapeId.value = '';
      }
    }
  };

  const reorderLayers = (fromIndex: number, toIndex: number) => {
    // お絵描きレイヤーが関与する場合は移動不可
    const fromShape = shapes.value[fromIndex];
    const toShape = shapes.value[toIndex];
    if (isDrawingShape(fromShape) || isDrawingShape(toShape)) return;

    const [removed] = shapes.value.splice(fromIndex, 1);
    shapes.value.splice(toIndex, 0, removed);
  };

  return {
    shapes,
    selectedShapeId,
    selectLayer,
    moveLayerUp,
    moveLayerDown,
    deleteLayer,
    reorderLayers,
  };
}
