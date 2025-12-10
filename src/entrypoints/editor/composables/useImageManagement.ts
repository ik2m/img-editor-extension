import { ref, type Ref } from 'vue';
import type { Shape } from '../types';

type UseShapeNameCounters = ReturnType<typeof import('./useShapeNameCounters').useShapeNameCounters>;

/**
 * 画像の読み込み、リサイズ、ステージ寸法管理を行うcomposable
 */
export function useImageManagement(
  nameCounters: UseShapeNameCounters,
  shapes: Ref<Shape[]>
) {
  const imageUrl = ref<string>('');
  const originalImage = ref<HTMLImageElement | null>(null);
  const stageWidth = ref<number>(0);
  const stageHeight = ref<number>(0);
  const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });
  const imageElement = ref<HTMLImageElement | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
      loadImageToStage(imageUrl.value);
    };
    reader.readAsDataURL(file);
  };

  const loadImageToStage = (url: string) => {
    const img = new Image();
    img.onload = () => {
      originalImage.value = img;
      imageElement.value = img;
      stageWidth.value = img.width;
      stageHeight.value = img.height;
      layerScale.value = { x: 1, y: 1 };

      // カウンターとshapes配列をリセット
      nameCounters.resetCounters();
      shapes.value = [];
    };
    img.src = url;
  };

  const resizeToMaxWidth840 = () => {
    if (!originalImage.value) return;
    const img = originalImage.value;
    const maxWidth = 840;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
      layerScale.value = { x: ratio, y: ratio };
      stageWidth.value = width;
      stageHeight.value = height;
    } else {
      layerScale.value = { x: 1, y: 1 };
      stageWidth.value = width;
      stageHeight.value = height;
    }
  };

  return {
    imageUrl,
    originalImage,
    imageElement,
    stageWidth,
    stageHeight,
    layerScale,
    handleImageUpload,
    loadImageToStage,
    resizeToMaxWidth840,
  };
}
