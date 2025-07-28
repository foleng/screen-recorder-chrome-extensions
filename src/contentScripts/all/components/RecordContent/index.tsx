import { Button, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { MediaType } from '@/extensions/recorder';
import MessageService from "@/extensions/handlers/MessageService";
import { MessageTypeEnum } from "@/extensions/handlers/types";
import { useStore, popupStore } from '@/extensions/store';

interface IRecordContent {
  mediaType: MediaType;
}

const RecordContent: React.FC<IRecordContent> = ({ mediaType }) => {
  const [cameraAccess, setCameraAccess] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const setVisible = useStore(popupStore, (state) => state.setVisible);

  // 向 Background Script 发送开始录屏的消息
  function startScreenRecording() {
    // 开启录制
    MessageService.sendMessage(
      MessageTypeEnum.START_RECORDING,
      {
        mediaType,
      },
      {
        callback: (response) => {
          if (response && !response.success) {
            console.error('Failed to start recording:', response.error);
          }
        }
      }
    );
  }

  const handleStartRecording = () => {
    startScreenRecording();
    setVisible(false);
  };

  useEffect(() => {
  }, []);

  return (
    <div>
      <div style={{ marginTop: 20 }}>
        <Button
          type="text"
          block
          style={{
            justifyContent: 'start',
            marginBottom: 10,
            display: 'flex',
          }}
          onClick={() => setCameraAccess(!cameraAccess)}
        >
          {cameraAccess ? '✔ Allow camera access' : 'Allow camera access'}
        </Button>

        <Button
          type="text"
          block
          style={{
            justifyContent: 'start',
            marginBottom: 10,
            display: 'flex',
          }}
          onClick={() => setMicrophoneAccess(!microphoneAccess)}
        >
          {microphoneAccess
            ? '✔ Allow microphone access'
            : 'Allow microphone access'}
        </Button>

        <Button
          type="primary"
          block
          onClick={handleStartRecording}
          style={{
            background: '#0057FF',
            borderRadius: 6,
            height: 40,
          }}
        >
          Start recording
        </Button>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Tooltip title="More options">
          <a href="#" style={{ color: '#0057FF' }}>
            Show more options
          </a>
        </Tooltip>
      </div>
    </div>
  );
};

export default RecordContent;
