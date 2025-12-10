<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import Konva from 'konva';
import EditorHeader from './components/EditorHeader.vue';
import EditorToolbar from './components/EditorToolbar.vue';
import EditorCanvas from './components/EditorCanvas.vue';
import LayerPanel from './components/LayerPanel.vue';
import type { RectShape, ArrowShape, Shape } from './types';
import { isRectShape, isArrowShape } from './types';

// 全ての状態変数をそのまま保持
const imageUrl = ref<string>('');
const originalImage = ref<HTMLImageElement | null>(null);
const stageWidth = ref<number>(0);
const stageHeight = ref<number>(0);
const layerScale = ref<{ x: number; y: number }>({ x: 1, y: 1 });
const imageElement = ref<HTMLImageElement | null>(null);
const shapes = ref<Shape[]>([]);
const selectedShapeId = ref('');
const rectCounter = ref(1);
const arrowCounter = ref(1);
const editingLayerId = ref<string>('');
const editingLayerName = ref<string>('');
const layerNameInput = ref<HTMLInputElement | null>(null);

// 全ての関数をそのまま保持
const getNextRectName = () => `矩形 ${rectCounter.value++}`;
const getNextArrowName = () => `矢印 ${arrowCounter.value++}`;

const handleTransformEnd = (e: any) => {
  const shape = shapes.value.find((s) => s.id === selectedShapeId.value);
  if (!shape) return;

  if (isRectShape(shape)) {
    shape.x = e.target.x();
    shape.y = e.target.y();
    shape.fill = Konva.Util.getRandomColor();
  } else if (isArrowShape(shape)) {
    const node = e.target;
    const newPoints = node.points();
    shape.points = newPoints as [number, number, number, number];
  }
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
    shapes.value = [];
    rectCounter.value = 1;
    arrowCounter.value = 1;
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
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index < shapes.value.length - 1) {
    [shapes.value[index], shapes.value[index + 1]] = [
      shapes.value[index + 1],
      shapes.value[index],
    ];
  }
};

const moveLayerDown = (id: string) => {
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index > 0) {
    [shapes.value[index], shapes.value[index - 1]] = [
      shapes.value[index - 1],
      shapes.value[index],
    ];
  }
};

const deleteLayer = (id: string) => {
  const index = shapes.value.findIndex((s) => s.id === id);
  if (index !== -1) {
    shapes.value.splice(index, 1);
    if (selectedShapeId.value === id) {
      selectedShapeId.value = '';
    }
  }
};

const selectLayer = (id: string) => {
  selectedShapeId.value = id;
};

const renameLayer = (id: string, newName: string) => {
  const shape = shapes.value.find((s) => s.id === id);
  if (shape) {
    shape.name = newName;
  }
};

const startEditLayerName = async (layer: Shape) => {
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
    name: getNextRectName(),
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    fill: 'rgba(255, 0, 0, 0.3)',
    stroke: '#ff0000',
    strokeWidth: 3,
    draggable: true,
  };
  shapes.value.push(rect);
  selectLayer(rect.id);
};

const addArrow = () => {
  if (!imageElement.value) return;
  const arrow: ArrowShape = {
    id: `arrow-${Date.now()}`,
    name: getNextArrowName(),
    points: [100, 100, 300, 200],
    stroke: '#ff0000',
    strokeWidth: 3,
    fill: '#ff0000',
    pointerLength: 20,
    pointerWidth: 20,
    draggable: true,
  };
  shapes.value.push(arrow);
  selectLayer(arrow.id);
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
        @add-arrow="addArrow"
      />

      <EditorCanvas
        :image-element="imageElement"
        :stage-width="stageWidth"
        :stage-height="stageHeight"
        :layer-scale="layerScale"
        :shapes="shapes"
        :selected-shape-id="selectedShapeId"
        :original-image="originalImage"
        @transform-end="handleTransformEnd"
        @stage-click="handleStageClick"
      />

      <LayerPanel
        :shapes="shapes"
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
