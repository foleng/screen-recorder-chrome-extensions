import { Recorder } from "./recorder";
import recordingStateMachine from "./recordingStateMachine";

const stateMachine = recordingStateMachine();

export class ScreenRecorder extends Recorder {
  /**
   * 启动屏幕录制
   */
  public async startRecording(): Promise<void> {
    try {
      stateMachine.transition('START');
      if (stateMachine.currentState === 'RECORDING') {
        // 获取屏幕流并开始录制
        this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // 初始化 MediaRecorder 实例并开始录制
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (event) => this.handleDataAvailable(event);
        this.mediaRecorder.start();
      }
    } catch (error) {
      console.error("Screen recording failed:", error);
    }
  }


}


