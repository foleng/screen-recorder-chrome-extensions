import { Recorder } from "./recorder";

export class ScreenshotRecorder extends Recorder {
  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = this.stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(videoTrack);
      const image = await imageCapture.takePhoto();
      const blob = await this.imageToBlob(image);
      this.saveRecording(blob);
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  }

  private async imageToBlob(image: Blob): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = await createImageBitmap(image);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }
}
