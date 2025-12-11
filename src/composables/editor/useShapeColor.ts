import { computed } from 'vue';
import { useSettings } from './useSettings';

/**
 * 図形の色を管理するcomposable
 * useSettingsを使用して設定を永続化
 */
export function useShapeColor() {
  const { settings, updateSetting } = useSettings();

  const rectangleColor = computed({
    get: () => settings.value.rectangleColor,
    set: (value: string) => updateSetting('rectangleColor', value),
  });

  const arrowColor = computed({
    get: () => settings.value.arrowColor,
    set: (value: string) => updateSetting('arrowColor', value),
  });

  const textColor = computed({
    get: () => settings.value.textColor,
    set: (value: string) => updateSetting('textColor', value),
  });

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
