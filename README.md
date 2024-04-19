# Import-Remote-Component
Dynamically loading remote components

```vue
// LoadRemoteComponent/Index.vue
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
```

```ts
// LoadRemoteComponent/loadComponent.ts
import { defineComponent, SlotsType, h } from 'vue';

export function loadComponent(
  urls: string[],
  name?: string,
  options?: {
    props: Record<string, any>;
    externals: Record<string, { import: any; export: string }>;
  },
  slot?: SlotsType
) {
  return new Promise(async (resolve, reject) => {
    if (!urls.length) return reject(new Error("请传入 url！"));
    const loadFile = (url: string) => {
      return new Promise(async (resolve, reject) => {
        const realUrl = url.split("?")[0];
        if (realUrl.endsWith("js")) {
          const text: string = await fetch(url)
            .then((res) => {
              if (res.status === 200) {
                return res.text();
              }
              return reject(new Error("远程资源加载出错！"));
            })
            .catch(() => {
              return reject(new Error("远程资源加载出错！"));
            });
          if (text) {
            const { externals = {} } = options || {};
            Object.keys(externals).forEach((key) => {
              window[externals[key].export] = externals[key].import;
            });

            import(/* @vite-ignore */URL.createObjectURL(new Blob([text], { type: "text/javascript" }))).then(() => {
              resolve(name ? new Function(`return ${name}`)() : undefined);
            });
          }
          return;
        }

        if (realUrl.endsWith("css")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = url;
          link.onload = function () {
            resolve("样式加载完成！");
          };
          link.onerror = function () {
            reject(new Error("样式加载出错！"));
          };
          document.head.append(link);
          return;
        }

        return reject(new Error("不支持的文件类型！"));
      });
    };

    const pList = urls.map((v) => loadFile(v));
    Promise.all(pList).then(([a, b]) => {
      let Comp = null;
      if (a !== "样式加载完成！") {
        Comp = a;
      } else {
        Comp = b;
      }

      resolve(h(Comp, options?.props, slot || null));
    });
  });
}

export const RemoteComp = defineComponent({
  name: 'RemoteComp',
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return () => h('div', {}, props.node);
  },
});
```

```vue
// App.vue
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
  import('vue').then(vue => {
    options.value.externals['vue'].import = vue
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
```


```tsx
// LoadRemoteComponent/index.tsx
import { createElement, ReactNode, useEffect, useState } from 'react';

export function loadComponent(
  urls: string[],
  name?: string,
  options?: {
    props: Record<string, any>,
    externals: Record<string, { import: any, export: string }>
  },
  children?: ReactNode
) {
  return new Promise(async (resolve, reject) => {
    if (!urls.length) return reject(new Error('请传入 url！'));
    const loadFile = (url: string) => {
      return new Promise(async (resolve, reject) => {
        const realUrl = url.split('?')[0];
        if (realUrl.endsWith('js')) {
          const text: string = await fetch(url)
            .then(res => {
              if (res.status === 200) {
                return res.text();
              }
              return reject(new Error('远程资源加载出错！'));
            })
            .catch(() => {
              return reject(new Error('远程资源加载出错！'));
            });
          if (text) {
            const { externals = {} } = options || {};
            Object.keys(externals).forEach(key => {
              window[externals[key].export] = externals[key].import;
            })
            const newText = text
              .replaceAll('e.React', 'window.React')
              .replaceAll('e.dayjs', 'window.dayjs')
              .replaceAll('e.antd', 'window.antd');
            import(/* @vite-ignore */URL.createObjectURL(new Blob([newText], { type: "text/javascript" }))).then(() => {
              resolve(name ? new Function(`return ${name}`)() : undefined)
            });
          }
          return;
        }

        if (realUrl.endsWith('css')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = url;
          link.onload = function () {
            resolve('样式加载完成！');
          }
          link.onerror = function () {
            reject(new Error('样式加载出错！'));
          }
          document.head.append(link);
          return;
        }

        return reject(new Error('不支持的文件类型！'));
      })
    }

    const pList = urls.map(v => loadFile(v));
    Promise.all(pList).then(([a, b]) => {
      let Comp = null;
      if (a !== '样式加载完成！') {
        Comp = a;
      } else {
        Comp = b;
      }

      resolve(createElement(Comp, options.props, children || null));
    })
  })
}

const RemoteComp = ({ node }) => node;

export default function LoadRemoteComponent(props) {
  const { urls, name, options, children } = props;

  const [Comp, setComp] = useState(null);

  useEffect(() => {
    (async () => {
      const Comp = await loadComponent(urls, name, options, children);
      setComp(Comp);
    })()
  }, [options])

  return <RemoteComp node={Comp} />
}
```

```tsx
// App.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import dayjs from 'dayjs';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LoadRemoteComponent from './components/LoadRemoteComponent'
import './App.css'

function App() {

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h3>加载远程组件示例：</h3>
      <LoadRemoteComponent
        urls={[
          'https://cdnjs.cloudflare.com/ajax/libs/antd/5.16.2/antd.min.js',
        ]}
        name="antd.Button"
        options={{
          props: {
            type: "primary",
            loading: true,
          },
          externals: {
            'react': {
              import: React,
              export: 'React'
            },
            'react-dom': {
              import: ReactDOM,
              export: 'ReactDOM'
            },
            'dayjs': {
              import: dayjs,
              export: 'dayjs'
            },
          }}
        }
      >
        按钮文字
      </LoadRemoteComponent>
    </>
  )
}

export default App
```
