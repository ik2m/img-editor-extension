import type { Ref } from 'vue';
import type { RectShape, Shape } from '../types';

type UseShapeNameCounters = ReturnType<
  typeof import('./useShapeNameCounters').useShapeNameCounters
>;

/**
 * 矩形図形の作成を管理するcomposable
 */
export function useRectangleShape(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextRectName: () => string,
  imageElement: Ref<HTMLImageElement | null>
) {
  const addRectangle = () => {
    if (!imageElement.value) return;
    const rect: RectShape = {
      id: `rect-${Date.now()}`,
      name: getNextRectName(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: 'rgba(255, 0, 0, 0.3)',
      stroke: '#ff0000',
      strokeWidth: 3,
      draggable: true,
    };
    shapes.value.push(rect);
    selectLayer(rect.id);
  };

  return {
    addRectangle,
  };
}
