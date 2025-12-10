<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import Konva from 'konva';
import type { Shape } from '../types';
import { isRectShape, isArrowShape } from '../types';

const props = defineProps<{
  imageElement: HTMLImageElement | null;
  stageWidth: number;
  stageHeight: number;
  layerScale: { x: number; y: number };
  shapes: Shape[];
  selectedShapeId: string;
  originalImage: HTMLImageElement | null;
}>();

const emit = defineEmits<{
  transformEnd: [e: any];
  stageClick: [targetId: string];
}>();

const transformer = ref<{ getNode(): Konva.Transformer } | null>(null);
const stageBgFill = computed(() => '#ffffff');

const updateTransformer = () => {
  if (!transformer.value) return;
  const transformerNode = transformer.value.getNode();
  const stage = transformerNode.getStage();
  if (!stage) return;

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

const handleStageMouseDown = (e: any) => {
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

// selectedShapeIdが変わったらtransformerを更新
watch(
  () => props.selectedShapeId,
  () => {
    updateTransformer();
  }
);

onMounted(() => {
  updateTransformer();
});
</script>

<template>
  <main
    class="relative flex flex-1 items-center justify-center overflow-auto bg-[#1a1a1a]"
  >
    <v-stage
      v-if="imageElement"
      :config="{ width: stageWidth, height: stageHeight }"
      class="shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      @mousedown="handleStageMouseDown"
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
              draggable: shape.draggable,
            }"
            @transformend="(e: any) => emit('transformEnd', e)"
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
              draggable: shape.draggable,
            }"
            @transformend="(e: any) => emit('transformEnd', e)"
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
