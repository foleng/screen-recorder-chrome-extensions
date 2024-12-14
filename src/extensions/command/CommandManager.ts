import { Command, CommandType } from "./command";
import { StartRecordingCommand } from "./startRecordingCommand";
import { StopRecordingCommand } from "./stopRecordingCommand";
import { GetStatusCommand } from "./getStatusCommand";
import { Message } from "@/utils/messaging";

export class CommandManager {
  private commands: Record<string, Command> = {};

  constructor() {
    // 注册所有命令
    this.registerCommand(CommandType.START_RECORDING, new StartRecordingCommand());
    this.registerCommand(CommandType.STOP_RECORDING, new StopRecordingCommand());
    this.registerCommand(CommandType.GET_STATUS, new GetStatusCommand());
  }

  // 注册命令
  registerCommand(type: string, command: Command): void {
    this.commands[type] = command;
  }

  // 执行命令
  async executeCommand(type: string, payload: Message['payload']): Promise<any> {
    const command = this.commands[type];
    if (command) {
      return await command.execute(payload);
    } else {
      return { success: false, error: "未知的type类型" };
    }
  }
}
