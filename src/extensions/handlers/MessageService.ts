import { HandlersManager } from './HandlersManager';
import { Message, ResponseType } from './types';

class MessageService {
  private static handlersManager: HandlersManager;

  static initialize() {
    this.handlersManager = new HandlersManager();
  }

  // 发送消息到指定目标（runtime 或 tabs）
  static sendMessage<T extends ResponseType = ResponseType>(
    message: Message,
    callback?: (response: T) => void,
    target: 'runtime' | 'tabs' = 'runtime',
    tabId?: number
  ) {
    if (target === 'tabs' && tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, message, (response: T) => {
        if (callback) callback(response);
      });
    } else {
      chrome.runtime.sendMessage(message, (response: T) => {
        if (callback) callback(response);
      });
    }
  }

  // 向特定标签页发送消息
  static sendTabMessage<T extends ResponseType = ResponseType>(
    tabId: number,
    message: Message,
    callback?: (response: T) => void
  ) {
    chrome.tabs.sendMessage(tabId, message, (response: T) => {
      if (callback) callback(response);
    });
  }

  // 向某个标签页的特定 window 发送消息
  static sendTabWindowMessage<T extends ResponseType = ResponseType>(
    tabId: number,
    message: Message,
    callback?: (response: T) => void
  ) {
    chrome.tabs.sendMessage(tabId, message, (response: T) => {
      if (callback) callback(response);
    });
  }

  static get manager() {
    return this.handlersManager;
  }

  // 监听相关方法
  static listenRuntimeMessage() {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      return this.handlersManager.handleRuntimeMessage(message, sender, sendResponse);
    });
  }

  static listenTabMessage(tabId: number) {
    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      if (sender.tab?.id === tabId) {
        return this.handlersManager.handleTabMessage(message, sender, sendResponse);
      }
      return false;
    });
  }

  static listenConnect() {
    chrome.runtime.onConnect.addListener((port) => {
      this.handlersManager.handleConnect(port);
    });
  }

  static listenTabUpdated() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handlersManager.handleTabUpdate(tabId, changeInfo, tab);
    });
  }
}

export default MessageService;

