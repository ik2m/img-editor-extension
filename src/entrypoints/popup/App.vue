<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue';

const openEditor = () => {
  browser.tabs.create({
    url: browser.runtime.getURL('/editor.html'),
  });
};
</script>

<template>
  <div class="flex justify-center gap-8">
    <a href="https://wxt.dev" target="_blank">
      <img
        src="/wxt.svg"
        class="h-24 p-6 transition-[filter] duration-300 will-change-[filter] hover:drop-shadow-[0_0_2em_#54bc4ae0]"
        alt="WXT logo"
      />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img
        src="@/assets/vue.svg"
        class="h-24 p-6 transition-[filter] duration-300 will-change-[filter] hover:drop-shadow-[0_0_2em_#42b883aa]"
        alt="Vue logo"
      />
    </a>
  </div>
  <HelloWorld msg="WXT + Vue" />
  <div class="p-8">
    <button
      type="button"
      @click="openEditor"
      class="rounded-lg bg-[#42b883] px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-[#359268]"
    >
      画像エディターを開く
    </button>
    <p class="mt-4 text-sm text-[#888]">新しいタブで画像編集ページが開きます</p>
  </div>
</template>
