import { ref, nextTick, type Ref } from 'vue';
import type { Shape } from '../types';

/**
 * レイヤー名のインライン編集を管理するcomposable
 */
export function useLayerNameEditing(renameLayer: (id: string, newName: string) => void) {
  const editingLayerId = ref<string>('');
  const editingLayerName = ref<string>('');
  const layerNameInput = ref<HTMLInputElement | null>(null);

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

  return {
    editingLayerId,
    editingLayerName,
    layerNameInput,
    startEditLayerName,
    finishEditLayerName,
    cancelEditLayerName,
  };
}
