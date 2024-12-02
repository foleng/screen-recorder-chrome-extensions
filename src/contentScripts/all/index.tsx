import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18+
import RecorderPopup from './components/Popup';
import './style.less';

// 定义一个根节点的容器并动态插入到 DOM 中
const renderComponent = () => {
  // 检查是否已经存在目标容器，避免重复创建
  const existingRoot = document.getElementById('popup-root');
  if (existingRoot) {
    return;
  }

  // 动态创建容器
  const container = document.createElement('div');
  container.id = 'popup-root';
  document.body.appendChild(container);

  // 使用 React 渲染 Popup 组件
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <div className="wrap">
        <RecorderPopup />
      </div>
    </React.StrictMode>,
  );
};

// 确保在页面加载完成后调用渲染函数
const onLoad = () => {
  renderComponent();
};

window.onload = onLoad;

import store from '@/extensions/store';

// 订阅状态变化
store.subscribe((state) => {
  console.log('Content-script received state change:', state);
  // 使用状态更新页面内容
  document.body.innerHTML = `<h1>${state.user.name}</h1>`;
});
