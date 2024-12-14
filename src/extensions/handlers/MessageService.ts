import { HandlersManager } from './HandlersManager';
import { Message, ResponseType } from './types';

class MessageService {
  private static handlersManager: HandlersManager;
  private static listeners: Map<MessageTypeEnum, Set<Function>> = new Map();

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

  // 添加一个新方法用于直接监听特定类型的消息
  static onMessage<T = any>(
    messageType: MessageTypeEnum,
    callback: (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: T) => void
    ) => boolean | void
  ): () => void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }

    const listeners = this.listeners.get(messageType)!;
    listeners.add(callback);

    if (listeners.size === 1) {
      // 第一个监听器，添加 chrome 监听器
      chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
        if (message.type === messageType) {
          let keepChannelOpen = false;
          listeners.forEach(listener => {
            const result = listener(message, sender, sendResponse);
            if (result === true) keepChannelOpen = true;
          });
          return keepChannelOpen;
        }
        return false;
      });
    }

    // 返回取消监听的函数
    return () => {
      const listeners = this.listeners.get(messageType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(messageType);
          // 可以选择是否要移除 chrome 监听器
        }
      }
    };
  }
}

export default MessageService;

