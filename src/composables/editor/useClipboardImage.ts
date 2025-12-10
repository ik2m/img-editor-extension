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

  const downloadImage = () => {
    if (!canvasRef.value) return;
    const stage = canvasRef.value.getStage();
    if (!stage) return;

    try {
      // Stageを画像に変換
      const dataURL = stage.toDataURL({ pixelRatio: 1 });

      // ダウンロード用のリンクを作成
      const link = document.createElement('a');
      link.download = `image-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('画像を保存しました');
    } catch (error) {
      console.error('画像の保存に失敗しました:', error);
      toast.error('画像の保存に失敗しました');
    }
  };

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
    downloadImage,
    copyImageToClipboard,
  };
}
