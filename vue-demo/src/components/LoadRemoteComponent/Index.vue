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

watch(() => [props, slot.default], () => {
  (async () => {
    const GComp = await loadComponent(props.urls, props.name, props.options, slot.default);
    Comp.value = GComp;
  })()
}, { deep: true })

</script>
