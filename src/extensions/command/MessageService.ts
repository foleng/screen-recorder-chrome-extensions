class MessageService {
  // 发送消息到指定目标（runtime 或 tabs）
  static sendMessage(
    message: any,
    callback?: (response: any) => void,
    target: 'runtime' | 'tabs' = 'runtime',  // 默认发送到 runtime
    tabId?: number
  ) {
    if (target === 'tabs' && tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (callback) callback(response);
      });
    } else {
      chrome.runtime.sendMessage(message, (response) => {
        if (callback) callback(response);
      });
    }
  }

  // 监听 runtime 消息
  static listenRuntimeMessage(
    callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void
  ) {
    chrome.runtime.onMessage.addListener(callback);
  }

  // 监听 tabs 消息
  static listenTabMessage(
    tabId: number,
    callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void
  ) {
    chrome.tabs.onUpdated.addListener((updatedTabId, changeInfo, tab) => {
      if (tabId === updatedTabId) {
        chrome.tabs.sendMessage(tabId, { type: 'tabUpdated', tab });
      }
    });
  }

  // 监听持久化连接
  static listenConnect(
    callback: (port: chrome.runtime.Port) => void
  ) {
    chrome.runtime.onConnect.addListener(callback);
  }

  // 监听 tabs 更新事件
  static listenTabUpdated(
    callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void
  ) {
    chrome.tabs.onUpdated.addListener(callback);
  }

  // 向特定标签页发送消息
  static sendTabMessage(tabId: number, message: any, callback?: (response: any) => void) {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (callback) callback(response);
    });
  }

  // 向某个标签页的特定 window 发送消息
  static sendTabWindowMessage(tabId: number, message: any, callback?: (response: any) => void) {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (callback) callback(response);
    });
  }
}

