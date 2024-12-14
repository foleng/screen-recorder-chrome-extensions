import React from 'react';
import ReactDOM from 'react-dom/client';
import RecorderPopup from './components/Popup';
import './style.less';
import { showPopupHandler } from "@/extensions/handlers/PopupHandlers";

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

// 注册事件
const initializeMessageHandlers = () => {
  // 初始化消息服务
  MessageService.initialize();

  // 注册所有处理器
  MessageService.commandManager.registerHandlers([
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new showPopupHandler()
    },
  ]);

  // 启动所有监听
  MessageService.listenRuntimeMessage();
}

// 确保在页面加载完成后调用渲染函数
const onLoad = () => {
  renderComponent();
  initializeMessageHandlers();
};

window.onload = onLoad;
