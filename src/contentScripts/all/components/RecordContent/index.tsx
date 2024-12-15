import { Button, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { createRecorder, MediaType } from '@/extensions/recorder';

interface IRecordContent {
  mediaType: MediaType;
}

const RecordContent: React.FC<IRecordContent> = ({ mediaType }) => {
  const [cameraAccess, setCameraAccess] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);

  const recorder = createRecorder(MediaType.Screen);
  // 向 Background Script 发送开始录屏的消息
  function startScreenRecording() {
    // 开启录制
    recorder.startRecording();
  }

  function stop() {
    // 停止录制
    recorder.stopRecording();
  }

  function pause() {
    // 暂停录制
    recorder.pauseRecording();
  }

  function resume() {
    // 恢复录制
    recorder.resumeRecording();
  }

  function reset() {
    // 重置录制
    recorder.resetRecording();
  }

  const handleStartRecording = () => {
    startScreenRecording();
  };

  useEffect(() => {
    // 监听录制状态

    recorder.on('state', (state) => {
      console.log('Recording state:', state);
    });
    // 监听外面传过来的指令，比如暂停、恢复、重置
  }, [recorder]);

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
        <Button
          type="primary"
          block
          onClick={stop}
          style={{
            background: '#0057FF',
            borderRadius: 6,
            height: 40,
          }}
        >
          Stop recording
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
