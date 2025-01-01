import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Configure FFmpeg with the correct path to the WASM file
const ffmpeg = createFFmpeg({
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

export class VideoEditor {
  private static instance: VideoEditor;
  private isLoaded = false;

  private constructor() {}

  static getInstance() {
    if (!VideoEditor.instance) {
      VideoEditor.instance = new VideoEditor();
    }
    return VideoEditor.instance;
  }

  async init() {
    if (!this.isLoaded) {
      try {
        await ffmpeg.load();
        this.isLoaded = true;
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error('Failed to initialize video editor');
      }
    }
  }

  async trimVideo(inputUrl: string, startTime: number, duration: number) {
    await this.init();
    try {
      const inputBlob = await fetch(inputUrl).then(r => r.blob());
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputBlob));

      await ffmpeg.run(
        '-i', 'input.mp4',
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        'output.mp4'
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    } catch (error) {
      console.error('Error in trimVideo:', error);
      throw new Error('Failed to trim video');
    } finally {
      try {
        // Clean up files
        ffmpeg.FS('unlink', 'input.mp4');
        ffmpeg.FS('unlink', 'output.mp4');
      } catch (e) {
        console.warn('Error cleaning up files:', e);
      }
    }
  }

  async addAudio(videoUrl: string, audioFile: File) {
    await this.init();
    try {
      const videoBlob = await fetch(videoUrl).then(r => r.blob());

      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoBlob));
      ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioFile));

      await ffmpeg.run(
        '-i', 'input.mp4',
        '-i', 'audio.mp3',
        '-c:v', 'copy',
        '-filter_complex', '[0:a][1:a]amix=inputs=2[a]',
        '-map', '0:v',
        '-map', '[a]',
        'output.mp4'
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      return URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    } catch (error) {
      console.error('Error in addAudio:', error);
      throw new Error('Failed to add audio');
    } finally {
      try {
        // Clean up files
        ffmpeg.FS('unlink', 'input.mp4');
        ffmpeg.FS('unlink', 'audio.mp3');
        ffmpeg.FS('unlink', 'output.mp4');
      } catch (e) {
        console.warn('Error cleaning up files:', e);
      }
    }
  }

  async exportVideo(videoUrl: string, format: 'mp4' | 'webm') {
    await this.init();
    try {
      const videoBlob = await fetch(videoUrl).then(r => r.blob());
      ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoBlob));

      const outputName = `output.${format}`;
      if (format === 'webm') {
        await ffmpeg.run(
          '-i', 'input.mp4',
          '-c:v', 'libvpx-vp9',
          '-c:a', 'libopus',
          outputName
        );
      } else {
        await ffmpeg.run(
          '-i', 'input.mp4',
          '-c:v', 'libx264',
          '-preset', 'medium',
          '-crf', '23',
          outputName
        );
      }

      const data = ffmpeg.FS('readFile', outputName);
      return URL.createObjectURL(new Blob([data.buffer], { type: `video/${format}` }));
    } catch (error) {
      console.error('Error in exportVideo:', error);
      throw new Error(`Failed to export video as ${format}`);
    } finally {
      try {
        // Clean up files
        ffmpeg.FS('unlink', 'input.mp4');
        ffmpeg.FS('unlink', `output.${format}`);
      } catch (e) {
        console.warn('Error cleaning up files:', e);
      }
    }
  }
}
