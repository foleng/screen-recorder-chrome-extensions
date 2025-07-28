import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Editor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className={styles.error}>编辑器出现错误，请刷新页面重试。</div>;
    }

    return this.props.children;
  }
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
    tracks: [
      {
        id: 'track-1',
        type: 'video',
        clips: [],
      },
    ],
    selectedClipId: null,
  });

  const videoEditor = VideoEditor.getInstance();
  
  // 初始化视频编辑器
  useEffect(() => {
    const initEditor = async () => {
      try {
        setEditorState(prev => ({ ...prev, processing: true }));
        await videoEditor.init();
        setEditorState(prev => ({ ...prev, processing: false }));
      } catch (error) {
        console.error('初始化视频编辑器失败:', error);
        message.error('初始化视频编辑器失败: ' + (error instanceof Error ? error.message : '未知错误'));
        setEditorState(prev => ({ ...prev, processing: false }));
      }
    };
    
    initEditor();
  }, [videoEditor]);

  // 视频控制
  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        if (editorState.playing) {
          videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
        setEditorState(prev => ({ ...prev, playing: !prev.playing }));
      } catch (error) {
        console.error('视频播放失败:', error);
        message.error('视频播放失败');
      }
    }
  }, [editorState.playing]);

  // 裁剪功能
  const handleTrim = async () => {
    if (!videoUrl) {
      message.warning('请先加载视频');
      return;
    }

    if (editorState.trimStart >= editorState.trimEnd) {
      message.warning('裁剪开始时间必须小于结束时间');
      return;
    }

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      message.loading('正在裁剪视频...', 0);
      
      const duration = editorState.trimEnd - editorState.trimStart;
      const newUrl = await videoEditor.trimVideo(videoUrl, editorState.trimStart, duration);
      
      // 清理旧的URL
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      
      setVideoUrl(newUrl);
      
      // 更新时间轴中的视频片段
      // 计算新的持续时间（裁剪后的持续时间）
      const newDuration = duration;
      
      // 更新时间轴状态
      setTimeline(prev => ({
        ...prev,
        duration: newDuration,
        tracks: prev.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip => 
            clip.id === 'clip-1' ? {
              ...clip,
              duration: newDuration,
              source: {
                ...clip.source,
                url: newUrl
              }
            } : clip
          )
        }))
      }));
      
      // 更新编辑器状态
      setEditorState(prev => ({ ...prev, duration: newDuration, trimEnd: newDuration }));
      
      message.destroy();
      message.success('视频裁剪成功');
    } catch (error) {
      console.error('Error trimming video:', error);
      message.destroy();
      message.error('视频裁剪失败: ' + (error instanceof Error ? error.message : '未知错误'));
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
    if (!videoUrl) {
      message.warning('请先加载视频');
      return;
    }

    if (!file) {
      message.warning('请选择音频文件');
      return;
    }

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      message.loading('正在添加音频...', 0);
      
      const newUrl = await videoEditor.addAudio(videoUrl, file);
      
      // 清理旧的URL
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      
      setVideoUrl(newUrl);
      
      // 更新时间轴中的视频片段
      // 使用当前视频的持续时间
      const newDuration = editorState.duration || 10;
      
      // 更新时间轴状态
      setTimeline(prev => ({
        ...prev,
        duration: newDuration,
        tracks: prev.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip => 
            clip.id === 'clip-1' ? {
              ...clip,
              duration: newDuration,
              source: {
                ...clip.source,
                url: newUrl
              }
            } : clip
          )
        }))
      }));
      
      // 更新编辑器状态
      setEditorState(prev => ({ ...prev, duration: newDuration, trimEnd: newDuration }));
      
      message.destroy();
      message.success('音频添加成功');
    } catch (error) {
      console.error('Error adding audio:', error);
      message.destroy();
      message.error('音频添加失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setEditorState(prev => ({ ...prev, processing: false }));
    }
  };

  // 导出功能
  const handleExport = async (format: 'mp4' | 'webm') => {
    if (!videoUrl) {
      message.warning('请先加载视频');
      return;
    }

    try {
      setEditorState(prev => ({ ...prev, processing: true }));
      message.loading(`正在导出为 ${format.toUpperCase()} 格式...`, 0);
      
      const url = await videoEditor.exportVideo(videoUrl, format);

      const a = document.createElement('a');
      a.href = url;
      a.download = `exported-video.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.destroy();
      message.success(`视频已导出为 ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting video:', error);
      message.destroy();
      message.error('视频导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
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
      try {
        const url = await getLatestVideo();
        if (url) {
          setVideoUrl(url);
          
          // 将视频添加到时间轴
          const videoElement = document.createElement('video');
          videoElement.src = url;
          
          videoElement.onloadedmetadata = () => {
            const duration = videoElement.duration || 10; // 默认10秒
            setEditorState(prev => ({ ...prev, duration, trimEnd: duration }));
            
            // 更新时间轴状态，但避免不必要的更新
            setTimeline(prev => {
              // 检查是否需要更新
              const needsUpdate = prev.duration !== duration || 
                (prev.tracks.length > 0 && prev.tracks[0].clips.length === 0);
              
              if (needsUpdate) {
                return {
                  ...prev,
                  duration,
                  tracks: prev.tracks.map((track, index) => 
                    index === 0 ? {
                      ...track,
                      clips: [{
                        id: 'clip-1',
                        startTime: 0,
                        duration,
                        source: {
                          url,
                          type: 'video/mp4'
                        }
                      }]
                    } : track
                  )
                };
              }
              return prev;
            });
            
            videoElement.remove();
          };
        }
      } catch (error) {
        console.error('加载视频失败:', error);
        message.error('加载视频失败');
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
  const handleTimelineChange = useCallback((newTimeline: TimelineState) => {
    setTimeline(newTimeline);
  }, []);

  // 处理片段选择
  const handleClipSelect = useCallback((clipId: string) => {
    setTimeline(prev => ({ ...prev, selectedClipId: clipId }));
  }, []);

  const menuItems = [
    {
      title: '编辑',
      items: [
        {
          label: '裁剪',
          icon: <ScissorOutlined />,
          onClick: () => setEditorState(prev => ({ ...prev, showTrimModal: true })),
          disabled: editorState.processing || !videoUrl
        },
        {
          label: '添加音频',
          icon: <SoundOutlined />,
          onClick: () => document.getElementById('audio-upload')?.click(),
          disabled: editorState.processing || !videoUrl
        },
      ],
    },
    {
      title: '导出',
      items: [
        {
          label: '导出为 MP4',
          icon: <DownloadOutlined />,
          onClick: () => handleExport('mp4'),
          disabled: editorState.processing || !videoUrl
        },
        {
          label: '导出为 WebM',
          icon: <DownloadOutlined />,
          onClick: () => handleExport('webm'),
          disabled: editorState.processing || !videoUrl
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
                  disabled: item.disabled,
                }))}
              />
            </div>
          ))}
        </Sider>

        <Layout>
          <Content className={styles.content}>
            <div className={styles.videoPlayer}>
              <div className={styles.video}>
                {editorState.processing ? (
                  <div className={styles.loading}>
                    {videoUrl ? '正在初始化编辑器...' : '正在加载视频...'}
                  </div>
                ) : videoUrl ? (
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
                  <div className={styles.loading}>暂无视频可供编辑</div>
                )}
              </div>
            </div>

            <div className={styles.trackEditorContainer}>
              <ErrorBoundary>
                <TrackEditor
                  timeline={timeline}
                  onTimelineChange={handleTimelineChange}
                  onClipSelect={handleClipSelect}
                />
              </ErrorBoundary>
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
