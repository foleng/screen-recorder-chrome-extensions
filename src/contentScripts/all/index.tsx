
import { createRoot } from 'react-dom/client';
import RecorderPopup from './components/Popup';
import './style.less';

// 监听显示 Popup 的事件
window.addEventListener('SHOW_RECORDER_POPUP', () => {
  const container = document.getElementById('recorder-popup-container');
  if (container) {
    const root = createRoot(container);
    root.render(<RecorderPopup />);
  }
});

// import store from '@/extensions/store';

// // 订阅状态变化
// store.subscribe((state) => {
//   console.log('Content-script received state change:', state);
//   // 使用状态更新页面内容
//   document.body.innerHTML = `<h1>${state.user.name}</h1>`;
// });
