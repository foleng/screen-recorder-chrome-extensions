// background.ts
import { Message, ResponseType } from "@/utils/messaging";
import { CommandManager } from "./command/CommandManager";

const commandManager = new CommandManager();

chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
  console.log("Received message:", message);

  const {type, payload} = message || {}
  const response: ResponseType = await commandManager.executeCommand(type, payload);

  sendResponse(response);
  return true; // 表示异步响应
});
