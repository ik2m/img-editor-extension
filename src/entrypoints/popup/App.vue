<script lang="ts" setup>
import HelloWorld from "@/components/HelloWorld.vue";

const openEditor = () => {
  browser.tabs.create({
    url: browser.runtime.getURL("/editor.html"),
  });
};
</script>

<template>
  <div>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="logo" alt="WXT logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
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

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
