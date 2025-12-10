import { ref } from 'vue';
import type { Shape } from '@/components/editor/types';

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
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index < shapes.value.length - 1) {
      [shapes.value[index], shapes.value[index + 1]] = [
        shapes.value[index + 1],
        shapes.value[index],
      ];
    }
  };

  const moveLayerDown = (id: string) => {
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index > 0) {
      [shapes.value[index], shapes.value[index - 1]] = [
        shapes.value[index - 1],
        shapes.value[index],
      ];
    }
  };

  const deleteLayer = (id: string) => {
    const index = shapes.value.findIndex((s) => s.id === id);
    if (index !== -1) {
      shapes.value.splice(index, 1);
      if (selectedShapeId.value === id) {
        selectedShapeId.value = '';
      }
    }
  };

  const reorderLayers = (fromIndex: number, toIndex: number) => {
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
