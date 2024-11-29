// cameraRecorder.ts
import { Recorder } from "./recorder";

export class CameraRecorder extends Recorder {
  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = (event) => this.handleDataAvailable(event);
      this.mediaRecorder.start();
    } catch (error) {
      console.error("Camera recording failed:", error);
    }
  }
}
