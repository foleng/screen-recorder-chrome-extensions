import { createRecorder, MediaType } from '@/extensions/recorder';
import { getQueryParam } from '@/utils';
import { Col, Flex, Row, Typography } from 'antd';
import { useEffect, useRef } from 'react';
import { useSessionStorageState } from 'ahooks';
import styles from './index.less';

const { Title } = Typography;

const Recorder = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recordingState, setRecordingState] = useSessionStorageState('recorderState', {
    defaultValue: false
  });

  console.log(">>>>>>>>>>recordingState", recordingState);


  // 获取?type 的值
  useEffect(() => {
    const startRecorder = async () => {
      const { mediaType } = getQueryParam();
      if (mediaType) {
        const recorder = createRecorder(mediaType as MediaType, true);

        // 如果之前有录音状态，恢复录音
        if (recordingState) {
          await recorder.resumeRecording(); // 假设有 resumeRecording 方法
        } else {
          await recorder.startRecording(); // 等待录制开始
        }

        // 保存录音状态到 sessionStorage
        setRecordingState(true); // 标记为正在录音

        const stream = recorder.getStream();
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      }
    };

    startRecorder();

    // // 清理函数
    // return () => {
    //   setRecordingState(false); // 组件卸载时清除状态
    // };
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

