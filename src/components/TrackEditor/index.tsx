import React, { useRef, useState, useCallback } from 'react';
import { Button, Slider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Track, Clip, TimelineState } from '@/types/editor';
import styles from './index.less';

interface TrackEditorProps {
  timeline: TimelineState;
  onTimelineChange: (timeline: TimelineState) => void;
  onClipSelect: (clipId: string) => void;
}

const TrackEditor: React.FC<TrackEditorProps> = ({
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
    const step = timeline.zoom < 1 ? 1 : 0.5;
    for (let i = 0; i <= timeline.duration; i += step) {
      markers.push(
        <div
          key={i}
          className={styles.marker}
          style={{ left: `${(i / timeline.duration) * 100}%` }}
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

  // 处理片段拖动
  const handleClipDragStart = (
    e: React.MouseEvent,
    clip: Clip,
    trackId: string
  ) => {
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
      const clipIndex = newTimeline.tracks[trackIndex].clips.findIndex(
        (c) => c.id === dragData.clipId
      );

      const newStartTime = Math.max(
        0,
        dragData.originalStart + deltaTime
      );

      newTimeline.tracks[trackIndex].clips[clipIndex].startTime = newStartTime;
      onTimelineChange(newTimeline);
    },
    [isDragging, dragData, timeline]
  );

  const handleClipDragEnd = () => {
    setIsDragging(false);
    setDragData(null);
  };

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
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={styles.clip}
                    style={{
                      left: `${(clip.startTime / timeline.duration) * 100}%`,
                      width: `${(clip.duration / timeline.duration) * 100}%`,
                    }}
                    onMouseDown={(e) => handleClipDragStart(e, clip, track.id)}
                    onClick={() => onClipSelect(clip.id)}
                  >
                    {track.type === 'text' ? (
                      <span className={styles.clipText}>{clip.text}</span>
                    ) : (
                      <div className={styles.clipThumbnail}>
                        {track.type === 'video' && (
                          <video src={clip.source.url} />
                        )}
                        {track.type === 'audio' && (
                          <div className={styles.waveform} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
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

export default TrackEditor;
