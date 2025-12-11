import useSettingsStore from '@/stores/useSettingsStore';

/**
 * 図形の色を管理するcomposable
 * useSettingsStoreを使用して設定を永続化
 */
export function useShapeColor() {
  const {
    rectangleColor,
    arrowColor,
    textColor,
    setRectangleColor,
    setArrowColor,
    setTextColor,
  } = useSettingsStore();

  return {
    rectangleColor,
    arrowColor,
    textColor,
    setRectangleColor,
    setArrowColor,
    setTextColor,
  };
}
