<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import Konva from 'konva';
import type { RectShape } from '../types';

const props = defineProps<{
  imageElement: HTMLImageElement | null;
  stageWidth: number;
  stageHeight: number;
  layerScale: { x: number; y: number };
  rects: RectShape[];
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
  const rect = props.rects.find((r) => r.id === name);
  emit('stageClick', rect ? name : '');
};

// selectedShapeIdが変わったらtransformerを更新
watch(() => props.selectedShapeId, () => {
  updateTransformer();
});

onMounted(() => {
  updateTransformer();
});
</script>

<template>
  <main class="flex-1 flex items-center justify-center bg-[#1a1a1a] overflow-auto relative">
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
            fill: stageBgFill
          }"
        />
        <v-image
          :config="{
            x: 0,
            y: 0,
            image: imageElement,
            listening: false
          }"
        />
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
          @transformend="(e: any) => emit('transformEnd', e)"
        />
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>

    <div v-else class="text-center text-dark-muted">
      <p class="text-xl">画像をアップロードしてください</p>
    </div>
  </main>
</template>
