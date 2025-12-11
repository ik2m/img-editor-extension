import type { Ref } from 'vue';
import type { RectShape, Shape } from '@/components/editor/types';

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
  imageElement: Ref<HTMLImageElement | null>,
  selectedColor: Ref<string>
) {
  const addRectangle = () => {
    if (!imageElement.value) return;

    // 選択された色から透明度付きのfillを作成
    const color = selectedColor.value;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const fillColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

    const rect: RectShape = {
      id: `rect-${Date.now()}`,
      name: getNextRectName(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: fillColor,
      stroke: color,
      strokeWidth: 3,
      cornerRadius: 10,
      draggable: true,
    };
    shapes.value.push(rect);
    selectLayer(rect.id);
  };

  return {
    addRectangle,
  };
}
