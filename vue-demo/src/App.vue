<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <h3>加载远程组件示例：</h3>
  <LoadRemoteComponent
    :urls="urls"
    name="ElementPlus.ElButton"
    :options="options"
  >
    按钮文字
  </LoadRemoteComponent>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadRemoteComponent from './components/LoadRemoteComponent/Index.vue'
import { loadModule } from './components/LoadRemoteComponent/loadComponent';

const urls = ref([
  'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.7.0/index.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.7.0/index.min.css'
]);

const options = ref({
  props: {
    type: 'primary',
    loading: true
  },
  externals: {
    'vue': {
      import: '',
      export: 'Vue'
    },
  }
})

onMounted(() => {
  import('vue').then(async vue => {
    options.value.externals['vue'].import = vue;

    const { ElButton, ElCard, ElCarousel, ElDialog } = await loadModule(
      "https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.7.0/index.full.min.js",
      "ElementPlus",
      {
        externals: {
          vue: {
            import: vue,
            export: 'Vue'
          },
        },
      }
    );
    console.log(ElButton, ElCard, ElCarousel, ElDialog);
  })

})

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
