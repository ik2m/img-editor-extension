import { ref, type Ref } from 'vue';
import { toast } from 'vue-sonner';
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

  const loadImageFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageTypes = item.types.filter((type) => type.startsWith('image/'));
        if (imageTypes.length === 0) continue;

        const blob = await item.getType(imageTypes[0]);
        const url = URL.createObjectURL(blob);
        imageUrl.value = url;
        loadImageToStage(url);
        toast.success('クリップボードから画像を読み込みました');
        return;
      }
      toast.error('クリップボードに画像がありません');
    } catch (error) {
      console.error('クリップボードからの読み込みに失敗しました:', error);
      toast.error('クリップボードからの読み込みに失敗しました');
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
    loadImageFromClipboard,
  };
}
