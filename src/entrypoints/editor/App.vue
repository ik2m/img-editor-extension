<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';

const imageUrl = ref<string>('');
const originalImage = ref<HTMLImageElement | null>(null);

// Konva 用の状態
const stageWidth = ref<number>(0);
const stageHeight = ref<number>(0);
const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });

// <v-image> に渡す生の HTMLImageElement
const imageElement = ref<HTMLImageElement | null>(null);

// 追加した矩形を配列で管理（座標は元画像の座標系で保持）
type RectShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
};
const rects = ref<RectShape[]>([]);

// ステージの背景色を計算（背景を塗るために下敷きの <v-rect> を使う）
const stageBgFill = computed(() => '#ffffff');

onMounted(() => {
  // 初期はプレースホルダのみ表示。画像読み込み後にサイズを確定します。
});

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
      loadImageToStage(imageUrl.value);
    };
    reader.readAsDataURL(file);
  }
};

const loadImageToStage = (url: string) => {
  const img = new Image();
  img.onload = () => {
    originalImage.value = img;
    imageElement.value = img;

    // ステージサイズを画像サイズに合わせる
    stageWidth.value = img.width;
    stageHeight.value = img.height;

    // 初期スケールは 1
    layerScale.value = { x: 1, y: 1 };

    // 既存の図形は維持する場合はそのまま。初期動作を Fabric に合わせるならクリア。
    rects.value = [];
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

    // レイヤー全体をスケール（全オブジェクトに一括で効く）
    layerScale.value = { x: ratio, y: ratio };

    // ステージ（表示サイズ）も変更
    stageWidth.value = width;
    stageHeight.value = height;
  } else {
    // もともと 840 以下ならスケール変更不要
    layerScale.value = { x: 1, y: 1 };
    stageWidth.value = width;
    stageHeight.value = height;
  }
};

const addRectangle = () => {
  if (!imageElement.value) return;

  // 元画像の座標系で矩形を追加
  const rect: RectShape = {
    id: `rect-${Date.now()}`,
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    fill: 'rgba(255, 0, 0, 0.3)',
    stroke: '#ff0000',
    strokeWidth: 3,
    draggable: true
  };

  rects.value.push(rect);
};
</script>

<template>
  <div class="editor-container">
    <header class="editor-header">
      <h1>画像エディター</h1>
    </header>

    <div class="editor-workspace">
      <aside class="toolbar">
        <div class="tool-section">
          <h3>ファイル</h3>
          <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              id="file-input"
          />
          <label for="file-input" class="button">画像を開く</label>
        </div>

        <div class="tool-section">
          <h3>リサイズ</h3>
          <button
              class="button button-primary"
              @click="resizeToMaxWidth840"
              :disabled="!imageUrl"
          >
            max-width: 840pxにリサイズ
          </button>
        </div>

        <div class="tool-section">
          <h3>図形</h3>
          <button
              class="button"
              @click="addRectangle"
              :disabled="!imageUrl"
          >
            矩形を追加
          </button>
        </div>

        <div class="tool-section">
          <h3>編集ツール</h3>
          <button class="button">切り抜き</button>
          <button class="button">リサイズ</button>
          <button class="button">フィルター</button>
          <button class="button">回転</button>
        </div>
      </aside>

      <main class="canvas-area">
        <!-- Fabric の <canvas> は廃止し、Konva のステージ/レイヤーを使用 -->
        <v-stage
            v-if="imageElement"
            :config="{ width: stageWidth, height: stageHeight }"
            class="edit-canvas"
        >
          <v-layer :config="{ scaleX: layerScale.x, scaleY: layerScale.y }">
            <!-- 背景相当（Fabric の backgroundColor の代替） -->
            <v-rect
                :config="{
                x: 0,
                y: 0,
                width: originalImage?.width || 0,
                height: originalImage?.height || 0,
                fill: stageBgFill
              }"
            />
            <!-- 画像 -->
            <v-image
                :config="{
                x: 0,
                y: 0,
                image: imageElement,
                listening: false
              }"
            />
            <!-- 矩形たち -->
            <v-rect
                v-for="r in rects"
                :key="r.id"
                :config="{
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                fill: r.fill,
                stroke: r.stroke,
                strokeWidth: r.strokeWidth,
                draggable: r.draggable
              }"
            />
          </v-layer>
        </v-stage>

        <div v-else class="placeholder">
          <p>画像をアップロードしてください</p>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1e1e1e;
  color: #fff;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.editor-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.resolution-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e1e1e;
  border-radius: 4px;
}

.resolution-label {
  color: #aaa;
  font-size: 0.875rem;
}

.resolution-value {
  color: #42b883;
  font-weight: 600;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
}

.editor-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.toolbar {
  width: 250px;
  background: #252525;
  border-right: 1px solid #3d3d3d;
  padding: 1rem;
  overflow-y: auto;
}

.tool-section {
  margin-bottom: 2rem;
}

.tool-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #aaa;
}

.button {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  background: #3d3d3d;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
}

.button:hover {
  background: #4d4d4d;
}

.button:disabled {
  background: #2d2d2d;
  color: #666;
  cursor: not-allowed;
}

.button-primary {
  background: #42b883;
  font-weight: 600;
}

.button-primary:hover:not(:disabled) {
  background: #359268;
}

#file-input {
  display: none;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  overflow: auto;
  position: relative;
}

.edit-canvas {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.placeholder {
  text-align: center;
  color: #666;
}

.placeholder p {
  font-size: 1.2rem;
}
</style>