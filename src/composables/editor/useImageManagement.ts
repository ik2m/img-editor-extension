import { ref, type Ref } from 'vue';
import { toast } from 'vue-sonner';
import type { Shape } from '@/components/editor/types';

type UseShapeNameCounters = ReturnType<typeof import('./useShapeNameCounters').useShapeNameCounters>;

/**
 * 画像の読み込み、リサイズ、ステージ寸法管理を行うcomposable
 */
export function useImageManagement(
  nameCounters: UseShapeNameCounters,
  shapes: Ref<Shape[]>,
  targetWidth: Ref<number | null>
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

      // カウンターとshapes配列をリセット
      nameCounters.resetCounters();
      shapes.value = [];

      // ターゲット幅が指定されている場合はリサイズ
      if (targetWidth.value !== null && img.width !== targetWidth.value) {
        resizeImage(img, targetWidth.value);
      } else {
        // リサイズなしの場合はそのまま設定
        imageElement.value = img;
        stageWidth.value = img.width;
        stageHeight.value = img.height;
        layerScale.value = { x: 1, y: 1 };
      }
    };
    img.src = url;
  };

  const resizeImage = (img: HTMLImageElement, newTargetWidth: number) => {
    const currentWidth = img.width;
    const currentHeight = img.height;

    if (currentWidth === newTargetWidth) {
      imageElement.value = img;
      stageWidth.value = img.width;
      stageHeight.value = img.height;
      layerScale.value = { x: 1, y: 1 };
      return;
    }

    // リサイズ比率を計算
    const ratio = newTargetWidth / currentWidth;
    const newWidth = newTargetWidth;
    const newHeight = Math.round(currentHeight * ratio);

    // キャンバスで画像をリサイズ
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // リサイズされた画像を新しいImageとして読み込む
    const resizedDataURL = canvas.toDataURL('image/png');
    const resizedImg = new Image();
    resizedImg.onload = () => {
      originalImage.value = resizedImg;
      imageElement.value = resizedImg;
      stageWidth.value = newWidth;
      stageHeight.value = newHeight;
      layerScale.value = { x: 1, y: 1 };

      // 既存の図形の座標をリサイズに合わせて調整
      shapes.value.forEach((shape) => {
        if ('x' in shape && 'y' in shape) {
          shape.x = shape.x * ratio;
          shape.y = shape.y * ratio;
          if ('width' in shape && 'height' in shape) {
            shape.width = shape.width * ratio;
            shape.height = shape.height * ratio;
          }
          if ('fontSize' in shape) {
            shape.fontSize = Math.round(shape.fontSize * ratio);
          }
        }
        if ('points' in shape && Array.isArray(shape.points)) {
          // ArrowShapeのpointsは [x1, y1, x2, y2] のタプル型
          const scaledPoints = shape.points.map((p) => p * ratio);
          shape.points = [scaledPoints[0], scaledPoints[1], scaledPoints[2], scaledPoints[3]];
        }
        if ('strokeWidth' in shape) {
          shape.strokeWidth = Math.max(1, Math.round(shape.strokeWidth * ratio));
        }
        if ('lines' in shape) {
          shape.lines.forEach((line) => {
            line.points = line.points.map((p) => p * ratio);
            line.strokeWidth = Math.max(1, Math.round(line.strokeWidth * ratio));
          });
        }
      });

      toast.success(`画像を${newWidth}x${newHeight}pxにリサイズしました`);
    };
    resizedImg.src = resizedDataURL;
  };

  const loadImageFromBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    imageUrl.value = url;
    loadImageToStage(url);
    toast.success('クリップボードから画像を読み込みました');
  };

  const applyTargetWidth = (newTargetWidth: number | null) => {
    if (!originalImage.value) return;

    if (newTargetWidth === null) {
      // 元画像に戻す - originalImageを再読み込み
      imageElement.value = originalImage.value;
      stageWidth.value = originalImage.value.width;
      stageHeight.value = originalImage.value.height;
      layerScale.value = { x: 1, y: 1 };
    } else {
      resizeImage(originalImage.value, newTargetWidth);
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
    loadImageFromBlob,
    applyTargetWidth,
  };
}
