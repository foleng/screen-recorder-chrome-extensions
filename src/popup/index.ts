import MessageService from '@/extensions/handlers/MessageService';
import { ResponseType } from '@/utils/messaging';

// 开始录制按钮点击处理
function handleStartRecording() {
  MessageService.sendMessage<ResponseType>(
    {
      type: 'START_RECORDING',
      payload: { mediaType: 'screen' }
    },
    (response) => {
      if (response.success) {
        console.log('Recording started successfully');
      } else {
        console.error('Failed to start recording:', response.error);
      }
    }
  );
}

// 停止录制按钮点击处理
function handleStopRecording() {
  MessageService.sendMessage<ResponseType>(
    {
      type: 'STOP_RECORDING',
      payload: {}
    },
    (response) => {
      if (response.success) {
        console.log('Recording stopped successfully');
      } else {
        console.error('Failed to stop recording:', response.error);
      }
    }
  );
}
