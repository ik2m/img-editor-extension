<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import Konva from 'konva';
import EditorHeader from './components/EditorHeader.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import type { RectShape } from './types';

// 全ての状態変数をそのまま保持
const imageUrl = ref<string>('');
const originalImage = ref<HTMLImageElement | null>(null);
const stageWidth = ref<number>(0);
const stageHeight = ref<number>(0);
const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });
const imageElement = ref<HTMLImageElement | null>(null);
const rects = ref<RectShape[]>([]);
const selectedShapeId = ref('');
const rectCounter = ref(1);
const editingLayerId = ref<string>('');
const editingLayerName = ref<string>('');
const layerNameInput = ref<HTMLInputElement | null>(null);

// 全ての関数をそのまま保持
const getNextLayerName = () => `矩形 ${rectCounter.value++}`;

const handleTransformEnd = (e: any) => {
  const rect = rects.value.find((r) => r.id === selectedShapeId.value);
  if (!rect) return;
  rect.x = e.target.x();
  rect.y = e.target.y();
  rect.fill = Konva.Util.getRandomColor();
};

const handleStageClick = (targetId: string) => {
  selectedShapeId.value = targetId;
};

const handleImageUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string;
    loadImageToStage(imageUrl.value);
  };
  reader.readAsDataURL(file);
};

const loadImageToStage = (url: string) => {
  const img = new Image();
  img.onload = () => {
    originalImage.value = img;
    imageElement.value = img;
    stageWidth.value = img.width;
    stageHeight.value = img.height;
    layerScale.value = { x: 1, y: 1 };
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
    layerScale.value = { x: ratio, y: ratio };
    stageWidth.value = width;
    stageHeight.value = height;
  } else {
    layerScale.value = { x: 1, y: 1 };
    stageWidth.value = width;
    stageHeight.value = height;
  }
};

const moveLayerUp = (id: string) => {
  const index = rects.value.findIndex((r) => r.id === id);
  if (index < rects.value.length - 1) {
    [rects.value[index], rects.value[index + 1]] = [
      rects.value[index + 1],
      rects.value[index],
    ];
  }
};

const moveLayerDown = (id: string) => {
  const index = rects.value.findIndex((r) => r.id === id);
  if (index > 0) {
    [rects.value[index], rects.value[index - 1]] = [
      rects.value[index - 1],
      rects.value[index],
    ];
  }
};

const deleteLayer = (id: string) => {
  const index = rects.value.findIndex((r) => r.id === id);
  if (index !== -1) {
    rects.value.splice(index, 1);
    if (selectedShapeId.value === id) {
      selectedShapeId.value = '';
    }
  }
};

const selectLayer = (id: string) => {
  selectedShapeId.value = id;
};

const renameLayer = (id: string, newName: string) => {
  const rect = rects.value.find((r) => r.id === id);
  if (rect) {
    rect.name = newName;
  }
};

const startEditLayerName = async (layer: RectShape) => {
  editingLayerId.value = layer.id;
  editingLayerName.value = layer.name;
  await nextTick();
  // layerNameInputはLayerPanel内で管理されるため、ここでの処理は不要
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
    draggable: true,
  };
  rects.value.push(rect);
  selectLayer(rect.id);
};
</script>

<template>
  <div class="bg-dark-bg flex h-screen flex-col text-white">
    <EditorHeader />

    <div class="flex flex-1 overflow-hidden">
      <EditorToolbar
        :image-url="imageUrl"
        @upload-image="handleImageUpload"
        @resize-image="resizeToMaxWidth840"
        @add-rectangle="addRectangle"
      />

      <EditorCanvas
        :image-element="imageElement"
        :stage-width="stageWidth"
        :stage-height="stageHeight"
        :layer-scale="layerScale"
        :rects="rects"
        :selected-shape-id="selectedShapeId"
        :original-image="originalImage"
        @transform-end="handleTransformEnd"
        @stage-click="handleStageClick"
      />

      <LayerPanel
        :rects="rects"
        :selected-shape-id="selectedShapeId"
        :image-url="imageUrl"
        :editing-layer-id="editingLayerId"
        :editing-layer-name="editingLayerName"
        @add-rectangle="addRectangle"
        @select-layer="selectLayer"
        @move-layer-up="moveLayerUp"
        @move-layer-down="moveLayerDown"
        @delete-layer="deleteLayer"
        @start-edit-name="startEditLayerName"
        @finish-edit-name="finishEditLayerName"
        @cancel-edit-name="cancelEditLayerName"
        @update-editing-name="(name) => (editingLayerName = name)"
      />
    </div>
  </div>
</template>
