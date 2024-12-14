import MessageService from '@/extensions/handlers/MessageService';
import { HandlerType, MessageTypeEnum } from '@/extensions/handlers/types';
import {
  StartRecordingHandler,
  StopRecordingHandler,
  RecordingTabHandler
} from '@/extensions/handlers/RecordingHandlers';

// 初始化消息服务和处理器
const initializeMessageHandlers = () => {
  // 注册所有监听器
  MessageService.registerHandlers([
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StartRecordingHandler()
    },
    {
      type: HandlerType.RUNTIME_MESSAGE,
      handler: new StopRecordingHandler()
    }
  ]);

  MessageService.onTabUpdate('complete', (tabId, changeInfo, tab) => {
    const handler = new RecordingTabHandler();
    handler.handleTabUpdate(tabId, changeInfo, tab);
  });

  // 方式二：直接监听
  MessageService.onRuntimeMessage(MessageTypeEnum.START_RECORDING, (message, sender, sendResponse) => {
    // 处理逻辑
    return true;
  });
}

export function initEvents() {
  initializeMessageHandlers();
  // ... 其他初始化代码
}
