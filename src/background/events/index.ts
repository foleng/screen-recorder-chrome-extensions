import MessageService from '@/extensions/command/MessageService';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';
import { createNewTab } from '@/utils';
import { Message, ResponseType } from '@/utils/messaging';
import { CommandManager } from './command/CommandManager';

const commandManager = new CommandManager();
const stateMachine = recordingStateMachine();

// 初始化消息服务
MessageService.initialize();

// 开始监听消息
MessageService.listenRuntimeMessage();

const handleMessage = async (
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: ResponseType) => void,
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

  if (tab.id) {
    try {
      // 检查是否是允许注入的页面
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
        console.log('Cannot inject scripts into chrome:// or extension pages');
        return;
      }
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          window.dispatchEvent(new CustomEvent('SHOW_RECORDER_POPUP'));
        },
      });
    } catch (error) {
      console.error('Script injection failed:', error);
    }
  }

  stateMachine.transition('START');
};

export function initEvents() {
  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.action.onClicked.addListener(handleActionClick);
}
