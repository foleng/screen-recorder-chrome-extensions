import {
  HandlerType,
  HandlerRegistry,
  RuntimeMessageHandler,
  TabMessageHandler,
  ConnectHandler,
  TabUpdateHandler
} from './types';
import { Message, ResponseType } from './types';

export class HandlersManager {
  private runtimeMessageHandlers: RuntimeMessageHandler[] = [];
  private tabMessageHandlers: TabMessageHandler[] = [];
  private connectHandlers: ConnectHandler[] = [];
  private tabUpdateHandlers: TabUpdateHandler[] = [];

  // 注册处理器
  registerHandler(registry: HandlerRegistry): void {
    switch (registry.type) {
      case HandlerType.RUNTIME_MESSAGE:
        this.runtimeMessageHandlers.push(registry.handler as RuntimeMessageHandler);
        break;
      case HandlerType.TAB_MESSAGE:
        this.tabMessageHandlers.push(registry.handler as TabMessageHandler);
        break;
      case HandlerType.CONNECT:
        this.connectHandlers.push(registry.handler as ConnectHandler);
        break;
      case HandlerType.TAB_UPDATE:
        this.tabUpdateHandlers.push(registry.handler as TabUpdateHandler);
        break;
    }
  }

  // 批量注册处理器
  registerHandlers(registries: HandlerRegistry[]): void {
    registries.forEach(registry => this.registerHandler(registry));
  }

  // 处理 Runtime 消息
  handleRuntimeMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean {
    for (const handler of this.runtimeMessageHandlers) {
      const result = handler.handleRuntimeMessage(message, sender, sendResponse);
      if (result === true) return true;
    }
    sendResponse({ success: false, error: "No handler found for this message type" });
    return false;
  }

  // 处理 Tab 消息
  handleTabMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean {
    for (const handler of this.tabMessageHandlers) {
      const result = handler.handleTabMessage(message, sender, sendResponse);
      if (result === true) return true;
    }
    sendResponse({ success: false, error: "No handler found for this message type" });
    return false;
  }

  // 处理连接
  handleConnect(port: chrome.runtime.Port): void {
    this.connectHandlers.forEach(handler => handler.handleConnect(port));
  }

  // 处理标签页更新
  handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    this.tabUpdateHandlers.forEach(handler => handler.handleTabUpdate(tabId, changeInfo, tab));
  }
}
