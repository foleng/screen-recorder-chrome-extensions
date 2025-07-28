import React, { useRef, useState, useCallback, useEffect, memo } from 'react';
import { Button, Slider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Track, Clip, TimelineState } from '@/types/editor';
import styles from './index.less';

interface TrackEditorProps {
  timeline: TimelineState;
  onTimelineChange: (timeline: TimelineState) => void;
  onClipSelect: (clipId: string) => void;
}

const TrackEditorComponent: React.FC<TrackEditorProps> = ({
  timeline,
  onTimelineChange,
  onClipSelect,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState<{
    clipId: string;
    trackId: string;
    startX: number;
    originalStart: number;
  } | null>(null);

  // 计算时间轴刻度
  const getTimelineMarkers = () => {
    const markers = [];
    // 确保时间轴有持续时间
    const duration = timeline.duration || 10;
    const step = duration < 10 ? 1 : duration < 30 ? 2 : 5;
    
    for (let i = 0; i <= duration; i += step) {
      markers.push(
        <div
          key={i}
          className={styles.marker}
          style={{ left: `${(i / duration) * 100}%` }}
        >
          <div className={styles.markerLine} />
          <div className={styles.markerTime}>{formatTime(i)}</div>
        </div>
      );
    }
    return markers;
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 确保至少有一个视频轨道
  useEffect(() => {
    if (timeline.tracks.length === 0) {
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        type: 'video',
        clips: [],
      };
      // 使用函数式更新避免依赖timeline对象本身
      onTimelineChange(prevTimeline => ({
        ...prevTimeline,
        tracks: [newTrack],
      }));
    }
  }, [timeline.tracks.length, onTimelineChange]);
  
  // 当时间轴持续时间更新时，确保所有轨道都有正确的持续时间
  useEffect(() => {
    if (timeline.duration > 0 && timeline.tracks.length > 0) {
      let hasChanges = false;
      const updatedTracks = timeline.tracks.map(track => {
        const updatedClips = track.clips.map(clip => {
          // 只有当片段持续时间大于时间轴持续时间时才调整
          if (clip.duration > timeline.duration) {
            hasChanges = true;
            return {
              ...clip,
              duration: timeline.duration
            };
          }
          return clip;
        });
        return {
          ...track,
          clips: updatedClips
        };
      });
      
      // 只有在确实有变化时才调用onTimelineChange
      if (hasChanges) {
        // 使用函数式更新避免依赖timeline对象本身
        onTimelineChange(prevTimeline => {
          // 再次检查是否确实需要更新
          if (JSON.stringify(prevTimeline.tracks) !== JSON.stringify(updatedTracks)) {
            return {
              ...prevTimeline,
              tracks: updatedTracks
            };
          }
          return prevTimeline;
        });
      }
    }
  }, [timeline.duration, timeline.tracks.length, onTimelineChange]);

  // 处理片段拖动
  const handleClipDragStart = (
    e: React.MouseEvent,
    clip: Clip,
    trackId: string
  ) => {
    e.preventDefault();
    setIsDragging(true);
    setDragData({
      clipId: clip.id,
      trackId,
      startX: e.clientX,
      originalStart: clip.startTime,
    });
  };

  const handleClipDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragData || !timelineRef.current) return;

      const timelineRect = timelineRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragData.startX;
      const deltaTime =
        (deltaX / timelineRect.width) * timeline.duration * timeline.zoom;

      const newTimeline = { ...timeline };
      const trackIndex = newTimeline.tracks.findIndex(
        (t) => t.id === dragData.trackId
      );
      if (trackIndex === -1) return;

      const clipIndex = newTimeline.tracks[trackIndex].clips.findIndex(
        (c) => c.id === dragData.clipId
      );
      if (clipIndex === -1) return;

      const newStartTime = Math.max(
        0,
        dragData.originalStart + deltaTime
      );

      newTimeline.tracks[trackIndex].clips[clipIndex].startTime = newStartTime;
      onTimelineChange(newTimeline);
    },
    [isDragging, dragData, timeline.duration, timeline.zoom, timeline.tracks, onTimelineChange]
  );

  const handleClipDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragData(null);
  }, []);

  // 添加事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleClipDragMove);
      window.addEventListener('mouseup', handleClipDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleClipDragMove);
      window.removeEventListener('mouseup', handleClipDragEnd);
    };
  }, [isDragging, handleClipDragMove, handleClipDragEnd]);

  // 添加新轨道
  const handleAddTrack = (type: Track['type']) => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      type,
      clips: [],
    };
    onTimelineChange({
      ...timeline,
      tracks: [...timeline.tracks, newTrack],
    });
  };

  // 删除轨道
  const handleDeleteTrack = (trackId: string) => {
    onTimelineChange({
      ...timeline,
      tracks: timeline.tracks.filter((t) => t.id !== trackId),
    });
  };

  return (
    <div className={styles.trackEditor}>
      <div className={styles.toolbar}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => handleAddTrack('video')}
        >
          添加视频轨道
        </Button>
        <Button
          icon={<PlusOutlined />}
          onClick={() => handleAddTrack('audio')}
        >
          添加音频轨道
        </Button>
        <Button
          icon={<PlusOutlined />}
          onClick={() => handleAddTrack('text')}
        >
          添加文本轨道
        </Button>
      </div>

      <div className={styles.timeline} ref={timelineRef}>
        <div className={styles.timelineRuler}>
          {getTimelineMarkers()}
        </div>

        <div className={styles.tracks}>
          {timeline.tracks.map((track) => (
            <div key={track.id} className={styles.track}>
              <div className={styles.trackHeader}>
                <span>{track.type}</span>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTrack(track.id)}
                />
              </div>
              <div className={styles.trackContent}>
                {track.clips.length > 0 ? (
                  track.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className={styles.clip}
                      style={{
                        left: `${(clip.startTime / (timeline.duration || 10)) * 100}%`,
                        width: `${(clip.duration / (timeline.duration || 10)) * 100}%`,
                      }}
                      onMouseDown={(e) => handleClipDragStart(e, clip, track.id)}
                      onClick={() => onClipSelect(clip.id)}
                    >
                      {track.type === 'text' ? (
                        <span className={styles.clipText}>{clip.text || '文本'}</span>
                      ) : (
                        <div className={styles.clipThumbnail}>
                          {track.type === 'video' && clip.source?.url && (
                            <video src={clip.source.url} />
                          )}
                          {track.type === 'audio' && (
                            <div className={styles.waveform} />
                          )}
                          {!clip.source?.url && <div>无内容</div>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyTrack}>
                    请添加视频片段
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <Slider
          min={0.1}
          max={2}
          step={0.1}
          value={timeline.zoom}
          onChange={(value) =>
            onTimelineChange({ ...timeline, zoom: value })
          }
        />
      </div>
    </div>
  );
};

const TrackEditor = memo(TrackEditorComponent, (prevProps, nextProps) => {
  // 只有当timeline或回调函数发生变化时才重新渲染
  return (
    JSON.stringify(prevProps.timeline) === JSON.stringify(nextProps.timeline) &&
    prevProps.onTimelineChange === nextProps.onTimelineChange &&
    prevProps.onClipSelect === nextProps.onClipSelect
  );
});

export default TrackEditor;
