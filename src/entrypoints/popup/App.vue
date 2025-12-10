<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue';

const openEditor = () => {
  browser.tabs.create({
    url: browser.runtime.getURL('/editor.html')
  });
};
</script>

<template>
  <div>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="h-24 p-6 will-change-[filter] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#54bc4ae0]" alt="WXT logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="h-24 p-6 will-change-[filter] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#42b883aa]" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="WXT + Vue" />
  <div class="card">
    <button type="button" @click="openEditor" class="open-editor-btn">
      画像エディターを開く
    </button>
    <p>新しいタブで画像編集ページが開きます</p>
  </div>
</template>
