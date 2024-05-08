# Import-Remote-Component

异步加载远程组件。

## react-demo

- 展示了 Antd-v5 加载远程按钮组件示例，[在线预览](https://stackblitz.com/edit/vitejs-vite-2g2fpe?terminal=dev)

![image](./react.png)

- 如何使用

```tsx
import React from "react";
import ReactDOM from "react-dom";
import dayjs from "dayjs";
import LoadRemoteComponent from "./components/LoadRemoteComponent";

# example 1
const { Button, Form, Table, Modal } = await loadModule(
  "https://cdnjs.cloudflare.com/ajax/libs/antd/5.16.2/antd.min.js",
  "antd",
  {
    externals: {
      react: {
        import: React,
        export: "React",
      },
      "react-dom": {
        import: ReactDOM,
        export: "ReactDOM",
      },
      dayjs: {
        import: dayjs,
        export: "dayjs",
      },
    },
  }
);

# example 2
<LoadRemoteComponent
  urls={[
    "https://cdnjs.cloudflare.com/ajax/libs/antd/5.16.2/antd.min.js",
  ]}
  name="antd.Button"
  options={{
    props: {
      type: "primary",
      shape: "round",
      icon: (
        <LoadRemoteComponent
          urls={[
            "https://cdnjs.cloudflare.com/ajax/libs/ant-design-icons/5.3.7/index.umd.min.js",
          ]}
          name="icons.SearchOutlined"
        />
      ),
    },
    externals: {
      react: {
        import: React,
        export: "React",
      },
      "react-dom": {
        import: ReactDOM,
        export: "ReactDOM",
      },
      dayjs: {
        import: dayjs,
        export: "dayjs",
      },
    },
  }}
>
  搜索按钮
</LoadRemoteComponent>
```

## vue-demo

- 展示了 Element-plus 加载远程按钮组件示例，[在线预览](https://stackblitz.com/edit/vitejs-vite-chrzxj?terminal=dev)

![image](./vue.png)

- 如何使用

```vue
# example 1
<template>
  <LoadRemoteComponent
    :urls="urls"
    name="ElementPlus.ElButton"
    :options="options"
  >
    按钮文字
  </LoadRemoteComponent>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import LoadRemoteComponent from "./components/LoadRemoteComponent/Index.vue";
import { loadModule } from './components/LoadRemoteComponent/loadComponent';

const urls = ref([
  "https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.7.0/index.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/element-plus/2.7.0/index.min.css",
]);

const options = ref({
  props: {
    type: "primary",
    loading: true,
  },
  externals: {
    vue: {
      import: "",
      export: "Vue",
    },
  },
});

onMounted(() => {
  import("vue").then((vue) => {
    options.value.externals["vue"].import = vue;

    # example 2
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
  });
});
</script>
```
