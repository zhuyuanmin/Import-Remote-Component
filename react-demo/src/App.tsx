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

export default App;