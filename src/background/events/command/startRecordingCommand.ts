import { ResponseType } from '@/utils/messaging';
import { Command } from './command';
import { createNewTab } from '@/utils';
import { MediaType } from '@/extensions/recorder';

export class StartRecordingCommand implements Command {
  async execute(payload: { mediaType: MediaType }): Promise<ResponseType> {
    // 启动录屏逻辑
    const options = {
      url: `recorder.html?mediaType=${payload.mediaType}`,
      pinned: true,
      index: 0,
      active: true, // 这里可以根据需要设置
    };
    createNewTab(options)
    return { success: true };
  }
}
