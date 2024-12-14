import { Message, ResponseType } from '@/utils/messaging';
import { CommandManager } from './command/CommandManager';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';
import { createNewTab } from '@/utils';

const commandManager = new CommandManager();
const stateMachine = recordingStateMachine();

const handleMessage = async (
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ResponseType) => void
) => {

  const { type, payload } = message || {};
  const response: ResponseType = await commandManager.executeCommand(
    type,
    payload,
  );

  sendResponse(response);
  return true;
};

const handleActionClick = async (tab: chrome.tabs.Tab) => {
  console.log('handleActionClick');
  // 如果当前正在录制，则暂停并跳转到编辑页面
  if (stateMachine.currentState === 'RECORDING') {
    stateMachine.transition('STOP');
    createNewTab({ url: 'editor.html' });
    return;
  }

  // 如果没有开始录制，在当前页面注入并显示 Popup
  if (tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // 创建并插入 Popup 容器
        const container = document.createElement('div');
        container.id = 'recorder-popup-container';
        document.body.appendChild(container);

        window.dispatchEvent(new CustomEvent('SHOW_RECORDER_POPUP'));
      }
    });
  }

  stateMachine.transition('START');
};

export function initEvents() {
  chrome.runtime.onMessage.addListener(handleMessage);
  console.log('initEvents');
  chrome.action.onClicked.addListener(handleActionClick);
}
