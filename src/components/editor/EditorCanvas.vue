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
  updateTextPosition: [shapeId: string, x: number, y: number];
  updateRectPosition: [shapeId: string, x: number, y: number];
  updateArrowPosition: [shapeId: string, deltaX: number, deltaY: number];
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

  // 矢印、矩形、テキストが選択されている場合はトランスフォーマーを無効化（カスタム操作を使用）
  const selectedShape = props.shapes.find((s) => s.id === props.selectedShapeId);
  if (selectedShape && (isArrowShape(selectedShape) || isRectShape(selectedShape) || isTextShape(selectedShape))) {
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

// 選択されたテキストを取得
const selectedText = computed(() => {
  const shape = props.shapes.find((s) => s.id === props.selectedShapeId);
  return shape && isTextShape(shape) ? shape : null;
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

// テキスト移動ハンドラのドラッグ処理
const handleTextHandleDragMove = (e: any, shapeId: string) => {
  const pos = e.target.position();
  // offsetを使っているので、posがそのままテキストの中心座標
  emit('updateTextPosition', shapeId, pos.x, pos.y);
};

// 矩形移動ハンドラのドラッグ処理
const rectMoveHandleStartPos = ref<{ x: number; y: number } | null>(null);

const handleRectMoveHandleMouseDown = (e: any, shapeId: string) => {
  e.cancelBubble = true;
  const pos = e.target.position();
  rectMoveHandleStartPos.value = { x: pos.x, y: pos.y };
};

const handleRectMoveHandleDragMove = (e: any, shapeId: string) => {
  if (!rectMoveHandleStartPos.value) return;
  const pos = e.target.position();
  const shape = props.shapes.find((s) => s.id === shapeId);
  if (!shape || !isRectShape(shape)) return;

  // ハンドルは中央にあるので、矩形の左上座標を計算
  const rectX = pos.x - shape.width / 2;
  const rectY = pos.y - shape.height / 2;
  emit('updateRectPosition', shapeId, rectX, rectY);
};

// 矢印移動ハンドラのドラッグ処理
const arrowMoveHandleStartPos = ref<{ x: number; y: number } | null>(null);

const handleArrowMoveHandleMouseDown = (e: any, shapeId: string) => {
  e.cancelBubble = true;
  const pos = e.target.position();
  arrowMoveHandleStartPos.value = { x: pos.x, y: pos.y };
};

const handleArrowMoveHandleDragMove = (e: any, shapeId: string) => {
  if (!arrowMoveHandleStartPos.value) return;
  const pos = e.target.position();

  // 移動量を計算
  const deltaX = pos.x - arrowMoveHandleStartPos.value.x;
  const deltaY = pos.y - arrowMoveHandleStartPos.value.y;

  emit('updateArrowPosition', shapeId, deltaX, deltaY);

  // 次のドラッグのために現在位置を保存
  arrowMoveHandleStartPos.value = { x: pos.x, y: pos.y };
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
              cornerRadius: shape.cornerRadius || 0,
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
              offsetX: shape.offsetX || 0,
              offsetY: shape.offsetY || 0,
              draggable: false,
            }"
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
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleRectHandleDragMove(e, selectedRect.id, 'br')"
          />
          <!-- 中央（移動用） -->
          <v-circle
            :config="{
              name: `${selectedRect.id}-handle-move`,
              x: selectedRect.x + selectedRect.width / 2,
              y: selectedRect.y + selectedRect.height / 2,
              radius: 12,
              fill: 'rgba(255, 255, 255, 0.6)',
              draggable: true,
            }"
            @mousedown="(e: any) => handleRectMoveHandleMouseDown(e, selectedRect.id)"
            @dragmove="(e: any) => handleRectMoveHandleDragMove(e, selectedRect.id)"
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
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleArrowHandleDragMove(e, selectedArrow.id, 2)"
          />
          <!-- 中央（移動用） -->
          <v-circle
            :config="{
              name: `${selectedArrow.id}-handle-move`,
              x: (selectedArrow.points[0] + selectedArrow.points[2]) / 2,
              y: (selectedArrow.points[1] + selectedArrow.points[3]) / 2,
              radius: 12,
              fill: 'rgba(255, 255, 255, 0.6)',
              draggable: true,
            }"
            @mousedown="(e: any) => handleArrowMoveHandleMouseDown(e, selectedArrow.id)"
            @dragmove="(e: any) => handleArrowMoveHandleDragMove(e, selectedArrow.id)"
          />
        </template>
        <!-- テキストの移動ハンドラ -->
        <template v-if="selectedText">
          <v-circle
            :config="{
              name: `${selectedText.id}-handle-move`,
              x: selectedText.x,
              y: selectedText.y,
              radius: 12,
              fill: 'rgba(255, 255, 255, 0.6)',
              draggable: true,
            }"
            @mousedown="handleHandleMouseDown"
            @dragmove="(e: any) => handleTextHandleDragMove(e, selectedText.id)"
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
