import { Recorder } from './recorder';

export class ScreenRecorder extends Recorder {
  /**
   * 启动屏幕录制
   */
  public async startRecording(): Promise<{ success: boolean; message: string }> {
    try {
      // 获取屏幕流并开始录制
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      // 添加 stream 结束监听
      this.stream.addEventListener('inactive', () => {
        console.log('用户停止了屏幕分享');
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = (event) =>
        this.handleDataAvailable(event);
      this.mediaRecorder.start();
      this.onStreamReady(this.stream);

      return { success: true, message: '开始录制' };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        return { success: false, message: '用户取消了屏幕分享' };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, message: `录制失败: ${message}` };
    }
  }
}
