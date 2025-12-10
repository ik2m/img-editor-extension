import type { Ref } from 'vue';
import type { ArrowShape, Shape } from '@/components/editor/types';

/**
 * 矢印図形の作成を管理するcomposable
 */
export function useArrowShape(
  shapes: Ref<Shape[]>,
  selectLayer: (id: string) => void,
  getNextArrowName: () => string,
  imageElement: Ref<HTMLImageElement | null>,
  selectedColor: Ref<string>
) {
  const addArrow = () => {
    if (!imageElement.value) return;
    const color = selectedColor.value;
    const arrow: ArrowShape = {
      id: `arrow-${Date.now()}`,
      name: getNextArrowName(),
      points: [100, 100, 300, 200],
      stroke: color,
      strokeWidth: 3,
      fill: color,
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
