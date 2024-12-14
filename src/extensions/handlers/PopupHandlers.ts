import { RuntimeMessageHandler, TabUpdateHandler } from './types';
import { createNewTab } from '@/utils';
import { Message, ResponseType, MessageTypeEnum } from './types';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';

// 处理开始录制的消息
export class showPopupHandler implements RuntimeMessageHandler {
  handleRuntimeMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean {
    if (message.type === MessageTypeEnum.START_RECORDING) {
      const options = {
        url: `recorder.html?mediaType=${message.payload.mediaType}`,
        pinned: true,
        index: 0,
        active: true,
      };
      createNewTab(options);
      sendResponse({ success: true });
      return true;
    }
    return false;
  }
}


