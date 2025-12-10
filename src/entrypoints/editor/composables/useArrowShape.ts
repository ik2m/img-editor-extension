import type { Ref } from 'vue';
import type { ArrowShape, Shape } from '@/components/editor/types';

/**
 * 矢印図形の作成を管理するcomposable
 */
export function useArrowShape(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextArrowName: () => string,
  imageElement: Ref<HTMLImageElement | null>
) {
  const addArrow = () => {
    if (!imageElement.value) return;
    const arrow: ArrowShape = {
      id: `arrow-${Date.now()}`,
      name: getNextArrowName(),
      points: [100, 100, 300, 200],
      stroke: '#ff0000',
      strokeWidth: 3,
      fill: '#ff0000',
      pointerLength: 20,
      pointerWidth: 20,
      draggable: true,
    };
    shapes.value.push(arrow);
    selectLayer(arrow.id);
  };

  return {
    addArrow,
  };
}
