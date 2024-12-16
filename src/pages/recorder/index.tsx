import { createRecorder, MediaType } from '@/extensions/recorder';
import { Col, Flex, Row, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useSessionStorageState } from 'ahooks';
import styles from './index.less';
import store from '@/extensions/store';

const { Title } = Typography;

const recorder = createRecorder(MediaType.Screen, true);

const Recorder = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recordingState, setRecordingState] = useSessionStorageState('recorderState', {
    defaultValue: false
  });

  // 获取?type 的值
  useEffect(() => {
    store.subscribe((state) => {
      const { recordingState } = state;
      switch (recordingState) {
        case 'RECORDING':
          recorder.startRecording();
          break;
        case 'PAUSED':
          recorder.pauseRecording();
          break;
        case 'STOPPED':
          recorder.stopRecording();
          break;
      }
    });
  }, [recordingState, setRecordingState]);

  return (
    <Flex align="center" justify='center' className={styles.recorderContainer}>
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title className={styles.title} level={2}>Do not close this tab during the recording!</Title>
        </Col>
        <Col span={24}>
          <div className={styles.videoWrap}>
            <video ref={videoRef} autoPlay style={{ width: '100%' }} />
          </div>
        </Col>
      </Row>
    </Flex>
  );
};

export default Recorder;

