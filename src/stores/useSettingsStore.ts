import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { storage } from '#imports';

/**
 * エディタ設定の型定義
 */
export interface EditorSettings {
  rectangleColor: string;
  arrowColor: string;
  textColor: string;
  targetWidth: number | 'original';
}

/**
 * デフォルト設定値
 */
const DEFAULT_SETTINGS: EditorSettings = {
  rectangleColor: '#FF3333',
  arrowColor: '#FF3333',
  textColor: '#000000',
  targetWidth: 640,
};

/**
 * ストレージアイテムの定義
 */
const rectangleColorItem = storage.defineItem<string>('local:editor_rectangleColor', {
  fallback: DEFAULT_SETTINGS.rectangleColor,
});

const arrowColorItem = storage.defineItem<string>('local:editor_arrowColor', {
  fallback: DEFAULT_SETTINGS.arrowColor,
});

const textColorItem = storage.defineItem<string>('local:editor_textColor', {
  fallback: DEFAULT_SETTINGS.textColor,
});

const targetWidthItem = storage.defineItem<number | 'original'>('local:editor_targetWidth', {
  fallback: DEFAULT_SETTINGS.targetWidth,
});

/**
 * エディタ設定を管理するstore
 * WXTのstorage APIを使用して設定を永続化
 */
const useSettingsStore = defineStore('settings', () => {
  // State
  const rectangleColor = ref(DEFAULT_SETTINGS.rectangleColor);
  const arrowColor = ref(DEFAULT_SETTINGS.arrowColor);
  const textColor = ref(DEFAULT_SETTINGS.textColor);
  const targetWidth = ref<number | 'original'>(DEFAULT_SETTINGS.targetWidth);
  const isLoaded = ref(false);

  /**
   * ストレージから設定を読み込む
   */
  const loadSettings = async () => {
    try {
      rectangleColor.value = await rectangleColorItem.getValue();
      arrowColor.value = await arrowColorItem.getValue();
      textColor.value = await textColorItem.getValue();
      targetWidth.value = await targetWidthItem.getValue();

      isLoaded.value = true;
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      isLoaded.value = true;
    }
  };

  // Actions
  const setRectangleColor = (color: string) => {
    rectangleColor.value = color;
  };

  const setArrowColor = (color: string) => {
    arrowColor.value = color;
  };

  const setTextColor = (color: string) => {
    textColor.value = color;
  };

  const setTargetWidth = (width: number | 'original') => {
    targetWidth.value = width;
  };

  // 初期化時に設定を読み込む
  loadSettings();

  // 設定の各プロパティを監視して自動保存
  watch(rectangleColor, (newValue) => {
    if (isLoaded.value) {
      rectangleColorItem.setValue(newValue);
    }
  });

  watch(arrowColor, (newValue) => {
    if (isLoaded.value) {
      arrowColorItem.setValue(newValue);
    }
  });

  watch(textColor, (newValue) => {
    if (isLoaded.value) {
      textColorItem.setValue(newValue);
    }
  });

  watch(targetWidth, (newValue) => {
    if (isLoaded.value) {
      targetWidthItem.setValue(newValue);
    }
  });

  return {
    // State
    rectangleColor,
    arrowColor,
    textColor,
    targetWidth,
    isLoaded,
    // Actions
    setRectangleColor,
    setArrowColor,
    setTextColor,
    setTargetWidth,
  };
});

/**
 * 設定ストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useSettingsStore();
  return { ...store, ...storeToRefs(store) };
};
