import { createRecorder, MediaType } from '@/extensions/recorder';
import recordingStateMachine from '@/extensions/recorder/recordingStateMachine';
import { getQueryParam } from '@/utils';
import { Col, Flex, Row, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import styles from './index.less';

const { Title } = Typography;

const recordingMachine = recordingStateMachine();

const Recorder = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { mediaType } = getQueryParam();
  const recorder = createRecorder(mediaType as MediaType, true);
  console.log('recorder', recorder);



  const initializeRecording = async () => {
    let machine: StateMachine;
    machine = await recordingStateMachine();

    machine.on((state) => {
      console.log('state', state);
      switch (state) {
        case 'RECORDING':
          recorder.startRecording();
          break;
        case 'PAUSED':
          recorder.pauseRecording();
          break;
        case 'STOPPED':
          recorder.stopRecording();
          break;
        default:
          break;
      }
    });

    machine.transition('START');
  };

  // 获取?type 的值
  useEffect(() => {
    recorder.getStream().then((stream) => {
      console.log('stream', stream);
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoRef.current.srcObject = stream;
      }
    });

    initializeRecording();
    return () => {
      machine.stopRecording();
    };
  }, []);

  return (
    <Flex align="center" justify="center" className={styles.recorderContainer}>
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title className={styles.title} level={2}>
            Do not close this tab during the recording!
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
