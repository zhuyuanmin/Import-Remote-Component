import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import dayjs from "dayjs";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import LoadRemoteComponent, { loadModule } from "./components/LoadRemoteComponent";
import "./App.css";

function App() {
  useEffect(() => {
    (async () => {
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

      console.log(Button, Form, Table, Modal);
    })()
  }, [])
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
    </>
  );
}

export default App;
