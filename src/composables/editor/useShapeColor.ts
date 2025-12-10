import { ref } from 'vue';

/**
 * 図形の色を管理するcomposable
 */
export function useShapeColor() {
  const rectangleColor = ref<string>('#ff0000'); // 矩形のデフォルト色（赤）
  const arrowColor = ref<string>('#ff0000'); // 矢印のデフォルト色（赤）
  const textColor = ref<string>('#000000'); // テキストのデフォルト色（黒）

  const setRectangleColor = (color: string) => {
    rectangleColor.value = color;
  };

  const setArrowColor = (color: string) => {
    arrowColor.value = color;
  };

  const setTextColor = (color: string) => {
    textColor.value = color;
  };

  return {
    rectangleColor,
    arrowColor,
    textColor,
    setRectangleColor,
    setArrowColor,
    setTextColor,
  };
}
