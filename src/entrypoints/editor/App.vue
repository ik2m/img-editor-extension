<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import Konva from "konva";
import {KonvaNodeConstructor} from "vue-konva";


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
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: true;
};
const rects = ref<RectShape[]>([]);
const selectedShapeId = ref('');
const transformer = ref<{ getNode(): Konva.Transformer } |null>(null);

// レイヤー管理用の状態
const rectCounter = ref(1);
const editingLayerId = ref<string>('');
const editingLayerName = ref<string>('');
const layerNameInput = ref<HTMLInputElement | null>(null);

// ヘルパー関数
const getNextLayerName = () => `矩形 ${rectCounter.value++}`;

const handleTransformEnd = (e: any) => {
  // find element in our state
  const rect = rects.value.find(
      (r) => r.id === selectedShapeId.value
  );
  if (!rect) return;

  // update the state with new properties
  rect.x = e.target.x();
  rect.y = e.target.y();
  // rect.rotation = e.target.rotation();
  // rect.scaleX = e.target.scaleX();
  // rect.scaleY = e.target.scaleY();

  // change fill color randomly
  rect.fill = Konva.Util.getRandomColor();
};

const updateTransformer = () => {
  if(!transformer.value) return;
  const transformerNode = transformer.value.getNode();
  const stage = transformerNode.getStage();
  if (!stage) return;
  const selected = selectedShapeId.value;

  const selectedNode = stage.findOne('.' + selected);
  // do nothing if selected node is already attached
  const currentNodes = transformerNode.nodes();
  if (currentNodes.length === 1 && selectedNode === currentNodes[0]) {
    return;
  }

  if (selectedNode) {
    // attach to selected node
    transformerNode.nodes([selectedNode]);
  } else {
    // remove transformer
    transformerNode.nodes([]);
  }
};

const handleStageMouseDown = (e: any) => {
  // clicked on stage - clear selection
  if (e.target === e.target.getStage()) {
    selectedShapeId.value = '';
    updateTransformer();
    return;
  }

  // clicked on transformer - do nothing
  const clickedOnTransformer =
      e.target.getParent().className === 'Transformer';
  if (clickedOnTransformer) {
    return;
  }

  // find clicked rect by its name
  const name = e.target.name();
  const rect = rects.value.find((r) => r.id === name);
  if (rect) {
    selectedShapeId.value = name;
  } else {
    selectedShapeId.value = '';
  }
  updateTransformer();
};

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
    rectCounter.value = 1;
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

// レイヤー管理関数
const moveLayerUp = (id: string) => {
  const index = rects.value.findIndex(r => r.id === id);
  if (index < rects.value.length - 1) {
    [rects.value[index], rects.value[index + 1]] =
    [rects.value[index + 1], rects.value[index]];
  }
};

const moveLayerDown = (id: string) => {
  const index = rects.value.findIndex(r => r.id === id);
  if (index > 0) {
    [rects.value[index], rects.value[index - 1]] =
    [rects.value[index - 1], rects.value[index]];
  }
};

const deleteLayer = (id: string) => {
  const index = rects.value.findIndex(r => r.id === id);
  if (index !== -1) {
    rects.value.splice(index, 1);
    if (selectedShapeId.value === id) {
      selectedShapeId.value = '';
      updateTransformer();
    }
  }
};

const selectLayer = (id: string) => {
  selectedShapeId.value = id;
  updateTransformer();
};

const renameLayer = (id: string, newName: string) => {
  const rect = rects.value.find(r => r.id === id);
  if (rect) {
    rect.name = newName;
  }
};

const startEditLayerName = async (layer: RectShape) => {
  editingLayerId.value = layer.id;
  editingLayerName.value = layer.name;
  await nextTick();
  if (layerNameInput.value) {
    layerNameInput.value.focus();
    layerNameInput.value.select();
  }
};

const finishEditLayerName = () => {
  if (editingLayerId.value) {
    renameLayer(editingLayerId.value, editingLayerName.value);
    editingLayerId.value = '';
  }
};

const cancelEditLayerName = () => {
  editingLayerId.value = '';
  editingLayerName.value = '';
};

const addRectangle = () => {
  if (!imageElement.value) return;

  // 元画像の座標系で矩形を追加
  const rect: RectShape = {
    id: `rect-${Date.now()}`,
    name: getNextLayerName(),
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
  selectLayer(rect.id);
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
            @mousedown="handleStageMouseDown"
            @touchstart="handleStageMouseDown"
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
                name: r.id,
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                fill: r.fill,
                stroke: r.stroke,
                strokeWidth: r.strokeWidth,
                draggable: r.draggable
              }"
                @transformend="handleTransformEnd"
            />
            <v-transformer ref="transformer" />
          </v-layer>
        </v-stage>

        <div v-else class="placeholder">
          <p>画像をアップロードしてください</p>
        </div>
      </main>

      <!-- レイヤーパネル -->
      <aside class="layer-panel">
        <div class="layer-panel-header">
          <h3>レイヤー</h3>
          <button @click="addRectangle" :disabled="!imageUrl" class="button button-sm">+</button>
        </div>

        <div class="layer-list">
          <!-- レイヤーなしの場合 -->
          <div v-if="rects.length === 0" class="layer-empty">
            レイヤーなし<br>
            <small>矩形を追加してください</small>
          </div>

          <!-- レイヤーアイテム（逆順で表示：配列の最後=最前面=リストの最上部） -->
          <div
            v-for="r in [...rects].reverse()"
            :key="r.id"
            :class="['layer-item', { 'layer-item--selected': selectedShapeId === r.id }]"
            @click="selectLayer(r.id)"
          >
            <div class="layer-item-content">
              <!-- カラープレビュー -->
              <div
                class="layer-color-preview"
                :style="{ backgroundColor: r.fill }"
              ></div>

              <!-- レイヤー名（編集可能） -->
              <span
                v-if="editingLayerId !== r.id"
                class="layer-name"
                @dblclick="startEditLayerName(r)"
              >
                {{ r.name }}
              </span>
              <input
                v-else
                v-model="editingLayerName"
                class="layer-name-input"
                @blur="finishEditLayerName"
                @keyup.enter="finishEditLayerName"
                @keyup.esc="cancelEditLayerName"
                ref="layerNameInput"
              />

              <!-- コントロールボタン -->
              <div class="layer-controls">
                <button
                  @click.stop="moveLayerUp(r.id)"
                  :disabled="rects[rects.length - 1].id === r.id"
                  class="layer-control-btn"
                  title="前面へ"
                >
                  ↑
                </button>
                <button
                  @click.stop="moveLayerDown(r.id)"
                  :disabled="rects[0].id === r.id"
                  class="layer-control-btn"
                  title="背面へ"
                >
                  ↓
                </button>
                <button
                  @click.stop="deleteLayer(r.id)"
                  class="layer-control-btn layer-control-btn--delete"
                  title="削除"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
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

/* レイヤーパネル */
.layer-panel {
  width: 250px;
  background: #252525;
  border-left: 1px solid #3d3d3d;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.layer-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.layer-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #aaa;
}

.button-sm {
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.layer-empty {
  text-align: center;
  color: #666;
  padding: 2rem 1rem;
  font-size: 0.875rem;
}

.layer-empty small {
  font-size: 0.75rem;
}

.layer-item {
  padding: 0.5rem;
  background: #1e1e1e;
  border: 1px solid #3d3d3d;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.layer-item:hover {
  background: #2d2d2d;
}

.layer-item--selected {
  background: #2d2d2d;
  border-color: #42b883;
}

.layer-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.layer-color-preview {
  width: 20px;
  height: 20px;
  border: 1px solid #3d3d3d;
  border-radius: 2px;
  flex-shrink: 0;
}

.layer-name {
  flex: 1;
  color: #fff;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-name-input {
  flex: 1;
  background: #3d3d3d;
  color: #fff;
  border: 1px solid #42b883;
  border-radius: 2px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  outline: none;
}

.layer-controls {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.layer-item:hover .layer-controls {
  opacity: 1;
}

.layer-control-btn {
  padding: 0.25rem 0.5rem;
  background: #3d3d3d;
  color: #fff;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s;
}

.layer-control-btn:hover:not(:disabled) {
  background: #4d4d4d;
}

.layer-control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.layer-control-btn--delete {
  color: #ff6b6b;
}

.layer-control-btn--delete:hover:not(:disabled) {
  background: #ff6b6b;
  color: #fff;
}
</style>