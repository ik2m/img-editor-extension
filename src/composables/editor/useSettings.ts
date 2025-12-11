import { ref, watch, type Ref } from 'vue';

/**
 * エディタ設定の型定義
 */
export interface EditorSettings {
  rectangleColor: string;
  arrowColor: string;
  textColor: string;
}

/**
 * デフォルト設定値
 */
const DEFAULT_SETTINGS: EditorSettings = {
  rectangleColor: '#FF3333',
  arrowColor: '#FF3333',
  textColor: '#000000',
};

/**
 * ストレージキーのプレフィックス
 */
const STORAGE_PREFIX = 'editor_';

/**
 * エディタ設定を管理するcomposable
 * browser.storage.localを使用して設定を永続化
 */
export function useSettings() {
  const settings = ref<EditorSettings>({ ...DEFAULT_SETTINGS });
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

      // 読み込んだ設定をマージ
      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        const storageKey = `${STORAGE_PREFIX}${key}`;
        if (result[storageKey] !== undefined) {
          (settings.value as any)[key] = result[storageKey];
        }
      });

      isLoaded.value = true;
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      isLoaded.value = true;
    }
  };

  /**
   * 特定の設定値をストレージに保存
   */
  const saveSetting = async <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    try {
      const storageKey = `${STORAGE_PREFIX}${key}`;
      await browser.storage.local.set({ [storageKey]: value });
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
    }
  };

  /**
   * 設定値を取得するヘルパー関数
   */
  const getSetting = <K extends keyof EditorSettings>(
    key: K
  ): Ref<EditorSettings[K]> => {
    return ref(settings.value[key]) as Ref<EditorSettings[K]>;
  };

  /**
   * 設定値を更新する関数
   */
  const updateSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    settings.value[key] = value;
  };

  // 初期化時に設定を読み込む
  loadSettings();

  // 設定の各プロパティを監視して自動保存
  Object.keys(DEFAULT_SETTINGS).forEach((key) => {
    watch(
      () => settings.value[key as keyof EditorSettings],
      (newValue) => {
        if (isLoaded.value) {
          saveSetting(key as keyof EditorSettings, newValue);
        }
      }
    );
  });

  return {
    settings,
    isLoaded,
    updateSetting,
    getSetting,
  };
}
