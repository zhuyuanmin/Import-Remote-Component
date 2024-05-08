import { defineComponent, SlotsType, h } from 'vue';

const cacheMap = new Map();

const loadFile = (url: string, name?: string, options?: any) => {
  return new Promise(async (resolve, reject) => {
    const realUrl = url.split("?")[0];
    if (realUrl.endsWith("js")) {
      let text: string = '';
      if (cacheMap.has(url)) {
        text = cacheMap.get(url).text;
      } else {
        text = await fetch(url)
          .then((res) => {
            if (res.status === 200) {
              return res.text();
            }
            return reject(new Error("远程资源加载出错！"));
          })
          .catch(() => {
            return reject(new Error("远程资源加载出错！"));
          });
        cacheMap.set(url, { ...cacheMap.get(url), text });
      }
      if (text) {
        const { externals = {} } = options || {};
        Object.keys(externals).forEach((key) => {
          window[externals[key].export] = externals[key].import;
        });

        import(/* @vite-ignore */URL.createObjectURL(new Blob([text], { type: "text/javascript" }))).then(() => {
          resolve(name ? new Function(`return ${name}`)() : undefined);
        }).catch(reject);
      }
      return;
    }

    if (realUrl.endsWith("css")) {
      if (cacheMap.has(url)) return resolve("样式加载完成！");

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
}

export function loadModule(
  url: string,
  name?: string,
  options?: {
    externals?: Record<string, { import: any, export: string }>
  }
) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error('请传入 url！'));

    if (cacheMap.get(url)?.Module) {
      const Module = cacheMap.get(url).Module;
      resolve(Module);
    } else {
      loadFile(url, name, options).then(Module => {
        cacheMap.set(url, { ...cacheMap.get(url), Module });
        resolve(Module);
      }).catch(reject);
    }
  })
};

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

    const url = urls.find(v => v.endsWith('js'));
    if (cacheMap.get(url)?.Comp) {
      const Comp = cacheMap.get(url).Comp;
      resolve(h(Comp, options?.props, slot || null));
    } else {
      const pList = urls.map((v) => loadFile(v, name, options));
      Promise.all(pList).then(([a, b]) => {
        let Comp = null;
        if (a !== "样式加载完成！") {
          Comp = a;
        } else {
          Comp = b;
        }
        cacheMap.set(url, { ...cacheMap.get(url), Comp });

        resolve(h(Comp, options?.props, slot || null));
      }).catch(reject);
    }
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
