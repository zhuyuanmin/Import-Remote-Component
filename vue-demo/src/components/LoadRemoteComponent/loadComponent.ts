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