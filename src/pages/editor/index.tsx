import React, { useEffect, useRef, useState } from 'react';
import { Layout, Menu, Button, Divider, Slider, message, Upload, Modal } from 'antd';
import {
  PlayCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  ScissorOutlined,
  SoundOutlined,
  PauseOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { getLatestVideo } from '@/extensions/storage/videoStore';
import { VideoEditor } from '@/extensions/services/videoEditor';
import styles from "./index.less";
import TrackEditor from '@/components/TrackEditor';
import { TimelineState } from '@/types/editor';

const { Header, Content, Footer, Sider } = Layout;

interface EditorState {
  playing: boolean;
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  processing: boolean;
  showTrimModal: boolean;
}

const LayoutComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    trimStart: 0,
    trimEnd: 0,
    processing: false,
    showTrimModal: false,
  });
  const [timeline, setTimeline] = useState<TimelineState>({
    currentTime: 0,
    duration: 0,
    zoom: 1,
    tracks: [],
    selectedClipId: null,
  });

  const videoEditor = VideoEditor.getInstance();

  // 视频控制
  const togglePlay = () => {
    if (videoRef.current) {
      if (editorState.playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setEditorState(prev => ({ ...prev, playing: !prev.playing }));
    }
  };

  // 裁剪功能
  const handleTrim = async () => {
    if (!videoUrl) return;

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      const duration = editorState.trimEnd - editorState.trimStart;
      const newUrl = await videoEditor.trimVideo(videoUrl, editorState.trimStart, duration);
      setVideoUrl(newUrl);
      message.success('视频裁剪成功');
    } catch (error) {
      console.error('Error trimming video:', error);
      message.error('视频裁剪失败');
    } finally {
      setEditorState(prev => ({
        ...prev,
        processing: false,
        showTrimModal: false
      }));
    }
  };

  // 添加音频
  const handleAddAudio = async (file: File) => {
    if (!videoUrl) return;

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      const newUrl = await videoEditor.addAudio(videoUrl, file);
      setVideoUrl(newUrl);
      message.success('音频添加成功');
    } catch (error) {
      console.error('Error adding audio:', error);
      message.error('音频添加失败');
    } finally {
      setEditorState(prev => ({ ...prev, processing: false }));
    }
  };

  // 导出功能
  const handleExport = async (format: 'mp4' | 'webm') => {
    if (!videoUrl) return;

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      const url = await videoEditor.exportVideo(videoUrl, format);

      const a = document.createElement('a');
      a.href = url;
      a.download = `exported-video.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success(`视频已导出为 ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting video:', error);
      message.error('视频导出失败');
    } finally {
      setEditorState(prev => ({ ...prev, processing: false }));
    }
  };

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setEditorState(prev => ({ ...prev, currentTime: video.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setEditorState(prev => ({
        ...prev,
        duration: video.duration,
        trimEnd: video.duration
      }));
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef.current]);

  // 加载视频
  useEffect(() => {
    const loadVideo = async () => {
      const url = await getLatestVideo();
      if (url) {
        setVideoUrl(url);
      }
    };
    loadVideo();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  // 处理时间轴变化
  const handleTimelineChange = (newTimeline: TimelineState) => {
    setTimeline(newTimeline);
  };

  // 处理片段选择
  const handleClipSelect = (clipId: string) => {
    setTimeline(prev => ({ ...prev, selectedClipId: clipId }));
  };

  const menuItems = [
    {
      title: '编辑',
      items: [
        {
          label: '裁剪',
          icon: <ScissorOutlined />,
          onClick: () => setEditorState(prev => ({ ...prev, showTrimModal: true }))
        },
        {
          label: '添加音频',
          icon: <SoundOutlined />,
          onClick: () => document.getElementById('audio-upload')?.click()
        },
      ],
    },
    {
      title: '导出',
      items: [
        {
          label: '导出为 MP4',
          icon: <DownloadOutlined />,
          onClick: () => handleExport('mp4')
        },
        {
          label: '导出为 WebM',
          icon: <DownloadOutlined />,
          onClick: () => handleExport('webm')
        },
      ],
    },
  ];

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.logo}>Screenity</div>
        <div className={styles.title}>
          {videoUrl ? '视频编辑器' : '暂无视频'}
        </div>
        <div className={styles.actions}>
          <Button type="link" className={styles.actionButton}>帮助中心</Button>
          <Button type="primary" className={styles.actionButton}>关注更新</Button>
        </div>
      </Header>

      <Layout>
        <Sider width={250} className={styles.sider}>
          {menuItems.map((menu, index) => (
            <div key={index} className={styles.menuSection}>
              <Divider orientation="left">{menu.title}</Divider>
              <Menu
                mode="vertical"
                items={menu.items.map((item, idx) => ({
                  key: `${menu.title}-${idx}`,
                  icon: item.icon,
                  label: item.label,
                  onClick: item.onClick,
                }))}
              />
            </div>
          ))}
        </Sider>

        <Layout>
          <Content className={styles.content}>
            <div className={styles.videoPlayer}>
              <div className={styles.video}>
                {videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className={styles.videoElement}
                    />
                    <div className={styles.controls}>
                      <Button
                        type="primary"
                        icon={editorState.playing ? <PauseOutlined /> : <PlayCircleOutlined />}
                        onClick={togglePlay}
                      />
                      <Slider
                        className={styles.timeSlider}
                        min={0}
                        max={editorState.duration}
                        value={editorState.currentTime}
                        onChange={(value) => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = value;
                          }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <span className={styles.loading}>正在加载视频...</span>
                )}
              </div>
            </div>

            <div className={styles.trackEditorContainer}>
              <TrackEditor
                timeline={timeline}
                onTimelineChange={handleTimelineChange}
                onClipSelect={handleClipSelect}
              />
            </div>
          </Content>
        </Layout>
      </Layout>

      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleAddAudio(file);
          }
        }}
      />

      <Modal
        title="裁剪视频"
        open={editorState.showTrimModal}
        onOk={handleTrim}
        onCancel={() => setEditorState(prev => ({ ...prev, showTrimModal: false }))}
        confirmLoading={editorState.processing}
      >
        <div className={styles.trimControls}>
          <div>开始时间：</div>
          <Slider
            min={0}
            max={editorState.duration}
            value={editorState.trimStart}
            onChange={(value) => setEditorState(prev => ({ ...prev, trimStart: value }))}
          />
          <div>结束时间：</div>
          <Slider
            min={0}
            max={editorState.duration}
            value={editorState.trimEnd}
            onChange={(value) => setEditorState(prev => ({ ...prev, trimEnd: value }))}
          />
        </div>
      </Modal>

      <Footer className={styles.footer}>
        <Button shape="circle" icon={<QuestionCircleOutlined />} />
      </Footer>
    </Layout>
  );
};

export default LayoutComponent;
