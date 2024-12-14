import { ResponseType } from "@/utils/messaging";
import { Command } from "./command";

export class StopRecordingCommand implements Command {
  async execute(): Promise<ResponseType> {
    // 停止录屏逻辑
    console.log("Stop recording...");
    return { success: true };
  }
}
