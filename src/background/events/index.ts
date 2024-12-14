import MessageService from '@/extensions/handlers/MessageService';
import { HandlerType, MessageTypeEnum } from '@/extensions/handlers/types';
import {
  StartRecordingHandler,
  StopRecordingHandler,
  RecordingTabHandler
} from '@/extensions/handlers/RecordingHandlers';

// 初始化消息服务和处理器
const initializeMessageHandlers = () => {
  // 初始化消息服务
  MessageService.initialize();

  // 注册所有处理器
  MessageService.commandManager.registerHandlers([
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StartRecordingHandler()
    },
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StopRecordingHandler()
    },
    {
      type: HandlerType.TAB_UPDATE,
      handler: new RecordingTabHandler()
    }
  ]);

  // 启动所有监听
  MessageService.listenRuntimeMessage();
  MessageService.listenTabUpdated();
}

const handleActionClick = async (tab: chrome.tabs.Tab) => {
  // 如果当前正在录制，则暂停并跳转到编辑页面
  if (stateMachine.currentState === 'RECORDING') {
    stateMachine.transition('STOP');
    createNewTab({ url: 'editor.html' });
    return;
  }

  // 检查标签页是否有效
  if (!tab.id) {
    console.warn('Invalid tab id');
    return;
  }

  try {
    // 检查是否是允许注入的页面
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
      console.warn('Cannot inject scripts into chrome:// or extension pages');
      return;
    }

    await MessageService.sendMessage({
      type: MessageTypeEnum.SHOW_RECORDER_POPUP,
      payload: { mediaType: 'screen' }
    });

    stateMachine.transition('START');
  } catch (error) {
    console.error('Failed to show recorder popup:', error);
  }
};



export function initEvents() {
  initializeMessageHandlers();
  chrome.action.onClicked.addListener(handleActionClick);
}
