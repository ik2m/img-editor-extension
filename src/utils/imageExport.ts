import { toast } from 'vue-sonner';

/**
 * DataURLから画像をダウンロードする
 */
export function downloadImage(dataURL: string) {
  try {
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
 * DataURLからクリップボードに画像をコピーする
 */
export async function copyImageToClipboard(dataURL: string) {
  try {
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
