<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Canvas, FabricImage, Rect } from 'fabric';

const imageUrl = ref<string>('');
const canvasElement = ref<HTMLCanvasElement | null>(null);
const fabricCanvas = ref<Canvas | null>(null);
const originalImage = ref<HTMLImageElement | null>(null);

onMounted(() => {
  if (canvasElement.value) {
    fabricCanvas.value = new Canvas(canvasElement.value, {
      backgroundColor: '#ffffff'
    });
  }
});

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string;
      loadImageToCanvas(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
};

const loadImageToCanvas = (url: string) => {
  if (!fabricCanvas.value) return;

  const img = new Image();

  img.onload = () => {
    originalImage.value = img;

    // Canvasのサイズを画像に合わせる
    fabricCanvas.value!.setDimensions({
      width: img.width,
      height: img.height
    });

    // Fabric.jsのImage objectを作成
    FabricImage.fromURL(url).then((fabricImg) => {
      fabricImg.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false
      });

      // 既存のオブジェクトをクリア
      fabricCanvas.value!.clear();
      // 背景画像として追加
      fabricCanvas.value!.add(fabricImg);
      fabricCanvas.value!.sendObjectToBack(fabricImg);
      fabricCanvas.value!.renderAll();
    });
  };

  img.src = url;
};

const resizeToMaxWidth840 = () => {
  if (!fabricCanvas.value || !originalImage.value) return;

  const img = originalImage.value;
  const maxWidth = 840;

  let width = img.width;
  let height = img.height;

  // max-width: 840pxでリサイズ計算
  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }

  // スケール比率を計算
  const scaleX = width / img.width;
  const scaleY = height / img.height;

  // Canvasのサイズを変更
  fabricCanvas.value.setDimensions({
    width: width,
    height: height
  });

  // すべてのオブジェクトをスケール
  const objects = fabricCanvas.value.getObjects();
  objects.forEach((obj) => {
    obj.scaleX = (obj.scaleX || 1) * scaleX;
    obj.scaleY = (obj.scaleY || 1) * scaleY;
    obj.left = (obj.left || 0) * scaleX;
    obj.top = (obj.top || 0) * scaleY;
    obj.setCoords();
  });

  fabricCanvas.value.renderAll();
};

const addRectangle = () => {
  if (!fabricCanvas.value) return;

  const rect = new Rect({
    left: 100,
    top: 100,
    width: 200,
    height: 150,
    fill: 'rgba(255, 0, 0, 0.3)',
    stroke: '#ff0000',
    strokeWidth: 3,
    cornerColor: '#42b883',
    cornerSize: 10,
    transparentCorners: false
  });

  fabricCanvas.value.add(rect);
  fabricCanvas.value.setActiveObject(rect);
  fabricCanvas.value.renderAll();
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
        <canvas ref="canvasElement" class="edit-canvas"></canvas>
        <div v-if="!imageUrl" class="placeholder">
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