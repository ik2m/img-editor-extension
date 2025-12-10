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
  <div class="flex flex-col h-screen bg-dark-bg text-white">
    <header class="flex items-center justify-between px-8 py-4 bg-dark-elevated border-b border-dark-border">
      <h1 class="text-2xl m-0">画像エディター</h1>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <aside class="w-sidebar bg-dark-panel border-r border-dark-border p-4 overflow-y-auto">
        <div class="mb-8">
          <h3 class="mt-0 mb-4 text-base text-dark-text">ファイル</h3>
          <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              id="file-input"
              class="hidden"
          />
          <label for="file-input" class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">画像を開く</label>
        </div>

        <div class="mb-8">
          <h3 class="mt-0 mb-4 text-base text-dark-text">リサイズ</h3>
          <button
              class="block w-full py-2 px-4 mb-2 bg-primary text-white border-none rounded cursor-pointer text-center transition-colors duration-200 font-semibold hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed"
              @click="resizeToMaxWidth840"
              :disabled="!imageUrl"
          >
            max-width: 840pxにリサイズ
          </button>
        </div>

        <div class="mb-8">
          <h3 class="mt-0 mb-4 text-base text-dark-text">図形</h3>
          <button
              class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d] disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed"
              @click="addRectangle"
              :disabled="!imageUrl"
          >
            矩形を追加
          </button>
        </div>

        <div class="mb-8">
          <h3 class="mt-0 mb-4 text-base text-dark-text">編集ツール</h3>
          <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">切り抜き</button>
          <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">リサイズ</button>
          <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">フィルター</button>
          <button class="block w-full py-2 px-4 mb-2 bg-dark-border text-white border-none rounded cursor-pointer text-center transition-colors duration-200 hover:bg-[#4d4d4d]">回転</button>
        </div>
      </aside>

      <main class="flex-1 flex items-center justify-center bg-[#1a1a1a] overflow-auto relative">
        <!-- Fabric の <canvas> は廃止し、Konva のステージ/レイヤーを使用 -->
        <v-stage
            v-if="imageElement"
            :config="{ width: stageWidth, height: stageHeight }"
            class="shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
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

        <div v-else class="text-center text-dark-muted">
          <p class="text-xl">画像をアップロードしてください</p>
        </div>
      </main>

      <!-- レイヤーパネル -->
      <aside class="w-sidebar bg-dark-panel border-l border-dark-border p-4 overflow-y-auto flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="m-0 text-base text-dark-text">レイヤー</h3>
          <button @click="addRectangle" :disabled="!imageUrl" class="py-1 px-3 text-xl leading-none block w-full py-2 px-4 mb-2 bg-primary text-white border-none rounded cursor-pointer text-center transition-colors duration-200 font-semibold hover:bg-primary-hover disabled:bg-dark-elevated disabled:text-dark-muted disabled:cursor-not-allowed">+</button>
        </div>

        <div class="flex flex-col gap-1">
          <!-- レイヤーなしの場合 -->
          <div v-if="rects.length === 0" class="text-center text-dark-muted py-8 px-4 text-sm">
            レイヤーなし<br>
            <small class="text-xs">矩形を追加してください</small>
          </div>

          <!-- レイヤーアイテム（逆順で表示：配列の最後=最前面=リストの最上部） -->
          <div
            v-for="r in [...rects].reverse()"
            :key="r.id"
            :class="[
              'p-2 bg-dark-bg border rounded cursor-pointer transition-all duration-200 group',
              selectedShapeId === r.id
                ? 'bg-dark-elevated border-primary'
                : 'border-dark-border hover:bg-dark-elevated'
            ]"
            @click="selectLayer(r.id)"
          >
            <div class="flex items-center gap-2">
              <!-- カラープレビュー -->
              <div
                class="w-5 h-5 border border-dark-border rounded-sm flex-shrink-0"
                :style="{ backgroundColor: r.fill }"
              ></div>

              <!-- レイヤー名（編集可能） -->
              <span
                v-if="editingLayerId !== r.id"
                class="flex-1 text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                @dblclick="startEditLayerName(r)"
              >
                {{ r.name }}
              </span>
              <input
                v-else
                v-model="editingLayerName"
                class="flex-1 bg-dark-border text-white border border-primary rounded px-2 py-1 text-sm outline-none"
                @blur="finishEditLayerName"
                @keyup.enter="finishEditLayerName"
                @keyup.esc="cancelEditLayerName"
                ref="layerNameInput"
              />

              <!-- コントロールボタン -->
              <div class="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  @click.stop="moveLayerUp(r.id)"
                  :disabled="rects[rects.length - 1].id === r.id"
                  class="py-1 px-2 bg-dark-border text-white border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-[#4d4d4d] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="前面へ"
                >
                  ↑
                </button>
                <button
                  @click.stop="moveLayerDown(r.id)"
                  :disabled="rects[0].id === r.id"
                  class="py-1 px-2 bg-dark-border text-white border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-[#4d4d4d] disabled:opacity-30 disabled:cursor-not-allowed"
                  title="背面へ"
                >
                  ↓
                </button>
                <button
                  @click.stop="deleteLayer(r.id)"
                  class="py-1 px-2 bg-dark-border text-danger border-none rounded-sm cursor-pointer text-xs transition-colors duration-200 hover:bg-danger hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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