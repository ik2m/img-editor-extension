import type Konva from 'konva';
import { toast } from 'vue-sonner';

/**
 * Konva Stageから画像をダウンロードする
 */
export function downloadImageFromStage(stage: Konva.Stage) {
  try {
    // トランスフォーマーを一時的に非表示にする
    const transformers = stage.find('Transformer');
    const transformerVisibilities = transformers.map((t) => t.visible());
    transformers.forEach((t) => t.visible(false));

    // Stageを画像に変換
    const dataURL = stage.toDataURL({ pixelRatio: 1 });

    // トランスフォーマーを元に戻す
    transformers.forEach((t, i) => t.visible(transformerVisibilities[i]));

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
}

/**
 * Konva Stageからクリップボードに画像をコピーする
 */
export async function copyImageFromStageToClipboard(stage: Konva.Stage) {
  try {
    // トランスフォーマーを一時的に非表示にする
    const transformers = stage.find('Transformer');
    const transformerVisibilities = transformers.map((t) => t.visible());
    transformers.forEach((t) => t.visible(false));

    // Stageを画像に変換
    const dataURL = stage.toDataURL({ pixelRatio: 1 });

    // トランスフォーマーを元に戻す
    transformers.forEach((t, i) => t.visible(transformerVisibilities[i]));

    // DataURLをBlobに変換
    const response = await fetch(dataURL);
    const blob = await response.blob();

    // クリップボードにコピー
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    toast.success('画像をクリップボードにコピーしました');
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error);
    toast.error('クリップボードへのコピーに失敗しました');
  }
}
