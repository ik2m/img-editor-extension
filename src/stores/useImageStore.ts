import { ref, computed, type Ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import useShapeStore from './useShapeStore';
import useDrawingStore from './useDrawingStore';

/**
 * 画像の読み込み、リサイズ、ステージ寸法管理を行うstore
 */
const useImageStore = defineStore('image', () => {
  const shapeStore = useShapeStore();
  const drawingStore = useDrawingStore();
  const { resetShapes, resetCounters, scaleShapes } = shapeStore;
  const { resetDrawingLayer, scaleDrawingLayer } = drawingStore;

  const imageUrl = ref<string>('');
  const originalImage = ref<HTMLImageElement | null>(null);
  const stageWidth = ref<number>(0);
  const stageHeight = ref<number>(0);
  const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });
  const imageElement = ref<HTMLImageElement | null>(null);

  const isImageLoaded = computed(() => !!imageElement.value);

  const handleImageUpload = (
    file: File,
    targetWidth: Ref<number | 'original'>
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
      loadImageToStage(imageUrl.value, targetWidth);
    };
    reader.readAsDataURL(file);
  };

  const loadImageToStage = (
    url: string,
    targetWidth: Ref<number | 'original'>
  ) => {
    const img = new Image();
    img.onload = () => {
      originalImage.value = img;

      // カウンターとshapes配列をリセット
      resetCounters();
      resetShapes();
      resetDrawingLayer();

      // ターゲット幅が指定されている場合はリサイズ
      if (targetWidth.value !== 'original' && img.width !== targetWidth.value) {
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
      scaleShapes(ratio);
      scaleDrawingLayer(ratio);

      toast.success(`画像を${newWidth}x${newHeight}pxにリサイズしました`);
    };
    resizedImg.src = resizedDataURL;
  };

  const loadImageFromBlob = (
    blob: Blob,
    targetWidth: Ref<number | 'original'>
  ) => {
    const url = URL.createObjectURL(blob);
    imageUrl.value = url;
    loadImageToStage(url, targetWidth);
    toast.success('クリップボードから画像を読み込みました');
  };

  const applyTargetWidth = (newTargetWidth: number | 'original') => {
    if (!originalImage.value) return;

    if (newTargetWidth === 'original') {
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
    isImageLoaded,
    handleImageUpload,
    loadImageToStage,
    loadImageFromBlob,
    applyTargetWidth,
  };
});

/**
 * 画像ストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useImageStore();
  return { ...store, ...storeToRefs(store) };
};
