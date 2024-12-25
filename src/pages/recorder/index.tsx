import { createRecorder, MediaType } from '@/extensions/recorder';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';
import { getQueryParam } from '@/utils';
import { Col, Flex, Row, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import styles from './index.less';
import { addVideo } from '@/extensions/storage';
import { recordingStore, useStore } from '@/extensions/store';

const { Title } = Typography;
let machine = await recordingStateMachine();

const Recorder = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { mediaType } = getQueryParam();
  const recorder = createRecorder(mediaType as MediaType, machine);
  const recordingTime = useStore(recordingStore, (state) => state.recordingTime);
  const setRecordingTime = useStore(recordingStore, (state) => state.setRecordingTime);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        recordingStore.setState((state) => ({
          ...state,
          recordingTime: state.recordingTime + 1
        }));
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const initializeRecording = async () => {
    machine.on(async (state: string) => {
      console.log('Recording state changed:', state);
      switch (state) {
        case 'PENDING':
          recorder.startRecording();
          break;
        case 'RECORDING':
          startTimer();
          break;
        case 'PAUSED':
          stopTimer();
          recorder.pauseRecording();
          break;
        case 'IDLE': {
          stopTimer();
          setRecordingTime(0);
          const res = await recorder.stopRecording();
          await addVideo(res);
          break;
        }
        default:
          break;
      }
    });

    machine.transition('START');
  };

  useEffect(() => {
    recorder.getStream().then((stream) => {
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    });

    initializeRecording();

    return () => {
      stopTimer();
      machine?.transition('STOP');
    };
  }, []); // 移除不必要的依赖

  return (
    <Flex align="center" justify="center" className={styles.recorderContainer}>
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title className={styles.title} level={2}>
            录制中... {formatTime(recordingTime)}
          </Title>
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
