<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import Konva from 'konva';
import type { Shape, DrawingShape, ArrowShape } from './types';
import { isRectShape, isArrowShape, isDrawingShape, isTextShape } from './types';

const props = defineProps<{
  imageElement: HTMLImageElement | null;
  stageWidth: number;
  stageHeight: number;
  layerScale: { x: number; y: number };
  shapes: Shape[];
  selectedShapeId: string;
  originalImage: HTMLImageElement | null;
  drawingMode: boolean;
  currentDrawing: DrawingShape | null;
}>();

const emit = defineEmits<{
  transformEnd: [e: any];
  stageClick: [targetId: string];
  startDrawing: [pos: { x: number; y: number }];
  continueDrawing: [pos: { x: number; y: number }];
  finishDrawing: [];
  updateArrowPoint: [shapeId: string, pointIndex: number, x: number, y: number];
  updateRectCorner: [shapeId: string, corner: string, x: number, y: number];
}>();

const transformer = ref<{ getNode(): Konva.Transformer } | null>(null);
const stage = ref<{ getNode(): Konva.Stage } | null>(null);
const stageBgFill = computed(() => '#ffffff');

const updateTransformer = () => {
  if (!transformer.value) return;
  const transformerNode = transformer.value.getNode();
  const stage = transformerNode.getStage();
  if (!stage) return;

  // お絵描きモード時はトランスフォーマーを無効化
  if (props.drawingMode) {
    transformerNode.nodes([]);
    return;
  }

  // 矢印または矩形が選択されている場合はトランスフォーマーを無効化（カスタムハンドラを使用）
  const selectedShape = props.shapes.find((s) => s.id === props.selectedShapeId);
  if (selectedShape && (isArrowShape(selectedShape) || isRectShape(selectedShape))) {
    transformerNode.nodes([]);
    return;
  }

  const selectedNode = stage.findOne('.' + props.selectedShapeId);
  const currentNodes = transformerNode.nodes();

  if (currentNodes.length === 1 && selectedNode === currentNodes[0]) {
    return;
  }

  if (selectedNode) {
    transformerNode.nodes([selectedNode]);
  } else {
    transformerNode.nodes([]);
  }
};

// 選択された矢印を取得
const selectedArrow = computed(() => {
  const shape = props.shapes.find((s) => s.id === props.selectedShapeId);
  return shape && isArrowShape(shape) ? shape : null;
});

// 選択された矩形を取得
const selectedRect = computed(() => {
  const shape = props.shapes.find((s) => s.id === props.selectedShapeId);
  return shape && isRectShape(shape) ? shape : null;
});

// 矢印ハンドラのドラッグ処理
const handleArrowHandleDragMove = (e: any, shapeId: string, pointIndex: number) => {
  const pos = e.target.position();
  emit('updateArrowPoint', shapeId, pointIndex, pos.x, pos.y);
};

// 矩形ハンドラのドラッグ処理
const handleRectHandleDragMove = (e: any, shapeId: string, corner: string) => {
  const pos = e.target.position();
  emit('updateRectCorner', shapeId, corner, pos.x, pos.y);
};

// ハンドラがクリックされたとき、ステージクリックイベントを防ぐ
const handleHandleMouseDown = (e: any) => {
  e.cancelBubble = true;
};

const handleStageMouseDown = (e: any) => {
  // 描画モードの場合
  if (props.drawingMode) {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    emit('startDrawing', { x: pos.x, y: pos.y });
    return;
  }

  // 通常モード（選択モード）
  if (e.target === e.target.getStage()) {
    emit('stageClick', '');
    return;
  }

  const clickedOnTransformer = e.target.getParent().className === 'Transformer';
  if (clickedOnTransformer) {
    return;
  }

  const name = e.target.name();
  const shape = props.shapes.find((s) => s.id === name);
  emit('stageClick', shape ? name : '');
};

const handleStageMouseMove = (e: any) => {
  if (!props.currentDrawing) return;
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  emit('continueDrawing', { x: pos.x, y: pos.y });
};

const handleStageMouseUp = () => {
  if (!props.currentDrawing) return;
  emit('finishDrawing');
};

// selectedShapeIdまたはdrawingModeが変わったらtransformerを更新
watch(
  () => [props.selectedShapeId, props.drawingMode],
  () => {
    updateTransformer();
  }
);

onMounted(() => {
  updateTransformer();
});

defineExpose({
  getStage: () => stage.value?.getNode(),
});
</script>

<template>
  <main
    class="relative flex flex-1 items-center justify-center overflow-auto bg-[#1a1a1a]"
  >
    <v-stage
      v-if="imageElement"
      ref="stage"
      :config="{ width: stageWidth, height: stageHeight }"
      :class="[
        'shadow-[0_4px_20px_rgba(0,0,0,0.5)]',
        drawingMode ? 'cursor-crosshair' : '',
      ]"
      @mousedown="handleStageMouseDown"
      @mousemove="handleStageMouseMove"
      @mouseup="handleStageMouseUp"
      @touchstart="handleStageMouseDown"
    >
      <v-layer :config="{ scaleX: layerScale.x, scaleY: layerScale.y }">
        <v-rect
          :config="{
            x: 0,
            y: 0,
            width: originalImage?.width || 0,
            height: originalImage?.height || 0,
            fill: stageBgFill,
          }"
        />
        <v-image
          :config="{
            x: 0,
            y: 0,
            image: imageElement,
            listening: false,
          }"
        />
        <template v-for="shape in shapes" :key="shape.id">
          <v-rect
            v-if="isRectShape(shape)"
            :config="{
              name: shape.id,
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
              fill: shape.fill,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              draggable: false,
            }"
          />
          <v-arrow
            v-else-if="isArrowShape(shape)"
            :config="{
              name: shape.id,
              points: shape.points,
              stroke: shape.stroke,
              strokeWidth: shape.strokeWidth,
              fill: shape.fill,
              pointerLength: shape.pointerLength,
              pointerWidth: shape.pointerWidth,
              draggable: false,
            }"
          />
          <template v-else-if="isDrawingShape(shape)">
            <v-line
              v-for="(line, index) in shape.lines"
              :key="`${shape.id}-line-${index}`"
              :config="{
                points: line.points,
                stroke: line.stroke,
                strokeWidth: line.strokeWidth,
                tension: shape.tension,
                lineCap: shape.lineCap,
                lineJoin: shape.lineJoin,
                listening: false,
              }"
            />
          </template>
          <v-text
            v-else-if="isTextShape(shape)"
            :config="{
              name: shape.id,
              x: shape.x,
              y: shape.y,
              text: shape.text,
              fontSize: shape.fontSize,
              fontFamily: shape.fontFamily,
              fontStyle: shape.fontStyle,
              fill: shape.fill,
              align: shape.align,
              draggable: shape.draggable,
            }"
            @transformend="(e: any) => emit('transformEnd', e)"
          />
        </template>
        <!-- 描画中の一時表示 -->
        <v-line
          v-if="currentDrawing"
          :config="{
            points: currentDrawing.points,
            stroke: currentDrawing.stroke,
            strokeWidth: currentDrawing.strokeWidth,
            tension: currentDrawing.tension,
            lineCap: currentDrawing.lineCap,
            lineJoin: currentDrawing.lineJoin,
            listening: false,
          }"
        />
        <!-- 矩形の4つの角ハンドラ -->
        <template v-if="selectedRect">
          <!-- 左上 -->
          <v-circle
            :config="{
              name: `${selectedRect.id}-handle-tl`,
              x: selectedRect.x,
              y: selectedRect.y,
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#FF3333',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleRectHandleDragMove(e, selectedRect.id, 'tl')"
          />
          <!-- 右上 -->
          <v-circle
            :config="{
              name: `${selectedRect.id}-handle-tr`,
              x: selectedRect.x + selectedRect.width,
              y: selectedRect.y,
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#FF3333',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleRectHandleDragMove(e, selectedRect.id, 'tr')"
          />
          <!-- 左下 -->
          <v-circle
            :config="{
              name: `${selectedRect.id}-handle-bl`,
              x: selectedRect.x,
              y: selectedRect.y + selectedRect.height,
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#FF3333',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleRectHandleDragMove(e, selectedRect.id, 'bl')"
          />
          <!-- 右下 -->
          <v-circle
            :config="{
              name: `${selectedRect.id}-handle-br`,
              x: selectedRect.x + selectedRect.width,
              y: selectedRect.y + selectedRect.height,
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#FF3333',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleRectHandleDragMove(e, selectedRect.id, 'br')"
          />
        </template>
        <!-- 矢印の始点・終点ハンドラ -->
        <template v-if="selectedArrow">
          <v-circle
            :config="{
              name: `${selectedArrow.id}-handle-start`,
              x: selectedArrow.points[0],
              y: selectedArrow.points[1],
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#213FFF',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleArrowHandleDragMove(e, selectedArrow.id, 0)"
          />
          <v-circle
            :config="{
              name: `${selectedArrow.id}-handle-end`,
              x: selectedArrow.points[2],
              y: selectedArrow.points[3],
              radius: 10,
              fill: 'rgba(255, 255, 255, 0.6)',
              stroke: '#213FFF',
              strokeWidth: 3,
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleArrowHandleDragMove(e, selectedArrow.id, 2)"
          />
        </template>
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>

    <div v-else class="text-dark-muted text-center">
      <p class="text-xl">画像をアップロードしてください</p>
    </div>
  </main>
</template>
