import React from 'react';
import ReactDOM from 'react-dom/client';
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
  
  // 在document_start阶段，body可能还不存在，所以我们需要检查
  if (document.body) {
    document.body.appendChild(container);
  } else {
    // 如果body不存在，等待DOM内容加载完成
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(container);
    });
  }

  // 使用 React 渲染 Popup 组件
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <RecorderPopup />
    </React.StrictMode>,
  );
};

// 立即尝试渲染组件，不等待页面完全加载
if (document.readyState === 'loading') {
  // DOM仍在加载中，等待DOM内容加载完成
  document.addEventListener('DOMContentLoaded', renderComponent);
} else {
  // DOM已经准备就绪
  renderComponent();
}
