export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  clips: Clip[];
}

export interface Clip {
  id: string;
  startTime: number;  // 在轨道中的开始时间
  duration: number;   // 片段持续时间
  source: {
    url: string;     // 媒体源URL
    type: string;    // 媒体类型
    startTime?: number; // 原始媒体的开始时间
    duration?: number;  // 原始媒体的持续时间
  };
  volume?: number;   // 音量（对音频和视频有效）
  text?: string;     // 文本内容（对文本轨道有效）
}

export interface TimelineState {
  currentTime: number;
  duration: number;
  zoom: number;
  tracks: Track[];
  selectedClipId: string | null;
}
