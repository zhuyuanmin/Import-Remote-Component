<template>
  <RemoteComp :node="Comp" />
</template>


<script setup lang="ts">
import { ref, watch, useSlots } from 'vue';
import { loadComponent, RemoteComp } from './loadComponent';

const Comp = ref(null);

const slot = useSlots();

const props = defineProps({
  urls: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
  },
  options: {
    type: Object,
  },
});

watch(props?.options.externals, () => {
  (async () => {
    console.log(11111111111)
    const GComp = await loadComponent(props.urls, props.name, props.options, slot.default);
    Comp.value = GComp;
  })()
})

</script>