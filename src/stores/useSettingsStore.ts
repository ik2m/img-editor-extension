import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';

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
 * ストレージキーのプレフィックス
 */
const STORAGE_PREFIX = 'editor_';

/**
 * エディタ設定を管理するstore
 * browser.storage.localを使用して設定を永続化
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
      const keys = Object.keys(DEFAULT_SETTINGS).map(
        (key) => `${STORAGE_PREFIX}${key}`
      );
      const result = await browser.storage.local.get(keys);

      // 読み込んだ設定を適用
      if (result[`${STORAGE_PREFIX}rectangleColor`] !== undefined) {
        rectangleColor.value = result[`${STORAGE_PREFIX}rectangleColor`];
      }
      if (result[`${STORAGE_PREFIX}arrowColor`] !== undefined) {
        arrowColor.value = result[`${STORAGE_PREFIX}arrowColor`];
      }
      if (result[`${STORAGE_PREFIX}textColor`] !== undefined) {
        textColor.value = result[`${STORAGE_PREFIX}textColor`];
      }
      if (result[`${STORAGE_PREFIX}targetWidth`] !== undefined) {
        targetWidth.value = result[`${STORAGE_PREFIX}targetWidth`];
      }

      isLoaded.value = true;
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      isLoaded.value = true;
    }
  };

  /**
   * 特定の設定値をストレージに保存
   */
  const saveSetting = async (key: string, value: any) => {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      await browser.storage.local.set({ [storageKey]: value });
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
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
      saveSetting('rectangleColor', newValue);
    }
  });

  watch(arrowColor, (newValue) => {
    if (isLoaded.value) {
      saveSetting('arrowColor', newValue);
    }
  });

  watch(textColor, (newValue) => {
    if (isLoaded.value) {
      saveSetting('textColor', newValue);
    }
  });

  watch(targetWidth, (newValue) => {
    if (isLoaded.value) {
      saveSetting('targetWidth', newValue);
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
