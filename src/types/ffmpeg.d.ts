declare module '@ffmpeg/ffmpeg' {
  export interface FFmpeg {
    load(): Promise<void>;
    run(...args: string[]): Promise<void>;
    FS(command: string, ...args: any[]): any;
  }

  export interface CreateFFmpegOptions {
    log?: boolean;
    logger?: (...args: any[]) => void;
    corePath?: string;
  }

  export function createFFmpeg(options?: CreateFFmpegOptions): FFmpeg;
  export function fetchFile(file: string | File | Blob): Promise<Uint8Array>;
}
