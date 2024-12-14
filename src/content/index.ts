import MessageService from '@/extensions/handlers/MessageService';
import { Message, ResponseType } from '@/utils/messaging';

// 监听来自 popup 或 background 的消息
MessageService.listenRuntimeMessage();

// 发送消息到 background
function reportRecordingStatus() {
  MessageService.sendMessage<ResponseType>(
    {
      type: 'REPORT_STATUS',
      payload: { status: 'recording' }
    },
    (response) => {
      console.log('Status reported:', response);
    }
  );
}
