<script lang="ts" setup>
import { ref } from 'vue';

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <h1 class="text-3xl font-bold">{{ msg }}</h1>

  <div class="p-8">
    <button
      type="button"
      @click="count++"
      class="rounded bg-[#646cff] px-4 py-2 text-white transition-colors duration-200 hover:bg-[#535bf2]"
    >
      count is {{ count }}
    </button>
    <p class="mt-4">
      Edit
      <code class="rounded bg-[#1a1a1a] px-2 py-1 text-sm"
        >components/HelloWorld.vue</code
      >
      to test HMR
    </p>
  </div>

  <p>
    Install
    <a
      href="https://github.com/vuejs/language-tools"
      target="_blank"
      class="text-[#646cff] hover:text-[#535bf2]"
      >Volar</a
    >
    in your IDE for a better DX
  </p>
  <p class="text-[#888]">Click on the WXT and Vue logos to learn more</p>
</template>
