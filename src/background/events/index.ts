import MessageService from '@/extensions/handlers/MessageService';
import { HandlerType, MessageTypeEnum } from '@/extensions/handlers/types';
import {
  StartRecordingHandler,
  StopRecordingHandler,
} from '@/extensions/handlers/RecordingHandlers';
import recordingStateMachine from "@/extensions/recorder/recordingStateMachine";
import { createNewTab } from "@/utils";

const stateMachine = recordingStateMachine();

// 初始化消息服务和处理器
const initializeMessageHandlers = () => {
  const handlers = [
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StartRecordingHandler()
    },
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StopRecordingHandler()
    }
  ];

  MessageService.registerHandlers(handlers);
}

const isRestrictedUrl = (url?: string): boolean => {
  if (!url) return false;
  return url.startsWith('chrome://') || url.startsWith('chrome-extension://');
}

const handleActionClick = async (tab: chrome.tabs.Tab) => {
  const { id, url } = tab;

  // 如果当前正在录制，则暂停并跳转到编辑页面
  if (stateMachine.currentState === 'RECORDING') {
    stateMachine.transition('STOP');
    createNewTab({ url: 'editor.html' });
    return;
  }

  if (!id) return;

  try {
    // 检查是否是允许注入的页面
    if (isRestrictedUrl(url)) {
      console.log('Cannot inject scripts into chrome:// or extension pages');
      return;
    }


    MessageService.sendTabMessage(
      id,
      MessageTypeEnum.SHOW_RECORDER_POPUP,
    );

  } catch (error) {
    console.error('Failed to show recorder popup:', error);
  }
};

export function initEvents() {
  initializeMessageHandlers();
  chrome.action.onClicked.addListener(handleActionClick);
}
