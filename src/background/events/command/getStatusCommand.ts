import { ResponseType } from "@/utils/messaging";
import { Command } from "./command";

export class GetStatusCommand implements Command {
  async execute(): Promise<ResponseType> {
    // 返回状态
    console.log("Getting status...");
    return { success: true, data: { recording: false } };
  }
}
