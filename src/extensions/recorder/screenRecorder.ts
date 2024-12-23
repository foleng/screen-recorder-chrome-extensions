import { Recorder } from './recorder';

export class ScreenRecorder extends Recorder {
  /**
   * 启动屏幕录制
   */
  public async startRecording(): Promise<void> {
    try {
      // 获取屏幕流并开始录制
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // 添加 stream 结束监听
      this.stream.addEventListener('inactive', () => {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
          this.machine.transition('STOP');
        }
      });
      this.machine.transition('CONFIRM');
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = (event) =>
        this.handleDataAvailable(event);
      this.mediaRecorder.start();
      this.onStreamReady(this.stream);

      return;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        this.machine.transition('CANCEL');
        return;
      }
      return;
    }
  }
}
