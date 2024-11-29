import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';

const Videos: React.FC = () => {
  const [cameraAccess, setCameraAccess] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);

  const handleStartRecording = () => {
    console.log('Recording started');
  };

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

export default Videos;
