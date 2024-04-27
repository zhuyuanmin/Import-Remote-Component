import { createElement, ReactNode, useEffect, useState } from 'react';

const cacheMap = new Map();

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
          let text: string = '';
          if (cacheMap.has(url)) {
            text = cacheMap.get(url);
          } else {
            text = await fetch(url)
              .then(res => {
                if (res.status === 200) {
                  return res.text();
                }
                return reject(new Error('远程资源加载出错！'));
              })
              .catch(() => {
                return reject(new Error('远程资源加载出错！'));
              });
          }
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
          if (cacheMap.has(url)) return resolve();

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
