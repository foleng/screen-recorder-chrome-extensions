import { StateMachine } from "./recordingStateMachine";

export abstract class Recorder {
  protected mediaRecorder: MediaRecorder | null = null;
  protected recordedChunks: Blob[] = [];
  protected stream: MediaStream | null = null;
  protected isPaused: boolean = false; // 添加暂停标记
  protected streamReadyResolve: ((stream: MediaStream) => void) | null = null;
  protected streamReadyPromise: Promise<MediaStream> | null = null;
  protected machine: StateMachine;

  constructor(machine: StateMachine) {
    this.machine = machine;
  }

  // 启动录制
  abstract startRecording(): Promise<void>;

  // 停止录制
  stopRecording(): Promise<Blob> {
    console.log('stopRecording', this.machine.currentState, this.machine.transition, this.mediaRecorder);
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject('Recorder not initialized');
        return;
      }
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach((track) => track.stop()); // 停止所有流的轨道
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.recordedChunks = []; // 清空数据
      resolve(blob);
    });
  }

  // 处理录制过程中的数据
  protected handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.recordedChunks.push(event.data);
    }
  }

  // 保存录制结果为文件
  saveRecording(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  }

  // 暂停录制
  pauseRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      console.log('Recording paused.');
    }
  }

  // 恢复录制
  resumeRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      console.log('Recording resumed.');
    }
  }

  // 重置录制器状态
  resetRecording(): void {
    // 引入状态机
    this.recordedChunks = [];
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.mediaRecorder = null;
    this.stream = null;
  }

  // 删除当前录制的文件
  deleteRecording(): void {
    // 引入状态机
    this.resetRecording();
    console.log('Recording deleted and reset.');
  }

  protected onStreamReady(stream: MediaStream): void {
    if (this.streamReadyResolve) {
      this.streamReadyResolve(stream);
      this.streamReadyResolve = null;
      this.streamReadyPromise = null;
    }
  }

  /**
   * 获取录制的流
   * @returns 当前的 MediaStream，如果未开始录制则返回 null
   */
  public getStream(): Promise<MediaStream | null> {
    if (this.stream) {
      return Promise.resolve(this.stream);
    }
    if (this.streamReadyPromise) {
      return this.streamReadyPromise;
    }
    this.streamReadyPromise = new Promise((resolve) => {
      this.streamReadyResolve = resolve;
    });
    return this.streamReadyPromise;
  }
}
