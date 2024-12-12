import { Message, ResponseType } from "@/utils/messaging";

export interface Command {
  execute(payload:Message['payload']): Promise<ResponseType>;
}

export enum CommandType {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  GET_STATUS = "GET_STATUS",
}
