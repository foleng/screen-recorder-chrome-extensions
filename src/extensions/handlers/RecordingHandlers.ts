import { RuntimeMessageHandler, TabUpdateHandler } from './types';
import { createNewTab } from '@/utils';
import { Message, ResponseType, MessageTypeEnum } from './types';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';

// 处理开始录制的消息
export class StartRecordingHandler implements RuntimeMessageHandler {
  handleRuntimeMessage(
    message: Message,
  ): boolean {
    console.log('StartRecordingHandler', message);
    if (message.type === MessageTypeEnum.START_RECORDING) {
      const options = {
        url: `recorder.html?mediaType=${message.payload?.mediaType}`,
        pinned: true,
        index: 0,
        active: true,
      };
      createNewTab(options);
      return true;
    }
    return false;
  }
}

// 处理停止录制的消息
export class StopRecordingHandler implements RuntimeMessageHandler {
  handleRuntimeMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean {
    if (message.type === MessageTypeEnum.STOP_RECORDING) {
      // 停止录制的逻辑
      recordingStateMachine().transition('STOP');
      sendResponse({ success: true });
      return true;
    }
    return false;
  }
}

// 监听标签页更新，处理录制状态
export class RecordingTabHandler implements TabUpdateHandler {
  handleTabUpdate(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): void {
    // 当录制标签页关闭时的处理
    if (changeInfo.status === 'complete' && tab.url?.includes('recorder.html')) {
      console.log('Recording tab updated:', tab.url);
    }
  }
}
