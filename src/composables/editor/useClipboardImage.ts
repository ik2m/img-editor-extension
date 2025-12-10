import { type Ref } from 'vue';
import { useClipboardItems } from '@vueuse/core';
import { toast } from 'vue-sonner';
import type Konva from 'konva';

/**
 * クリップボードへの画像コピーを管理するcomposable
 */
export function useClipboardImage(
  canvasRef: Ref<{ getStage: () => Konva.Stage | undefined } | null>
) {
  const { copy: copyToClipboard, copied, isSupported } = useClipboardItems();

  const copyImageToClipboard = async () => {
    if (!isSupported.value) {
      toast.error('お使いのブラウザはクリップボード機能に対応していません');
      return;
    }

    if (!canvasRef.value) return;
    const stage = canvasRef.value.getStage();
    if (!stage) return;

    try {
      // Stageを画像に変換
      const dataURL = stage.toDataURL({ pixelRatio: 1 });

      // DataURLをBlobに変換
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // クリップボードにコピー
      await copyToClipboard([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      if (copied.value) {
        toast.success('画像をクリップボードにコピーしました');
      }
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error);
      toast.error('クリップボードへのコピーに失敗しました');
    }
  };

  return {
    copyImageToClipboard,
  };
}
