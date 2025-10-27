<script lang="ts" setup>
import { ref } from 'vue';

const imageUrl = ref<string>('');
const canvas = ref<HTMLCanvasElement | null>(null);

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
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  const img = new Image();

  img.onload = () => {
    canvas.value!.width = img.width;
    canvas.value!.height = img.height;
    ctx?.drawImage(img, 0, 0);
  };

  img.src = url;
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
          <h3>編集ツール</h3>
          <button class="button">切り抜き</button>
          <button class="button">リサイズ</button>
          <button class="button">フィルター</button>
          <button class="button">回転</button>
        </div>
      </aside>

      <main class="canvas-area">
        <canvas ref="canvas" class="edit-canvas"></canvas>
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
  padding: 1rem 2rem;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.editor-header h1 {
  margin: 0;
  font-size: 1.5rem;
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
  max-width: 100%;
  max-height: 100%;
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