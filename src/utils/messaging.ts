// 消息类型枚举定义
export enum MessageTypeEnum {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  GET_STATUS = "GET_STATUS",
}

// 消息类型定义
export interface Message<T = {}> {
  type: MessageTypeEnum;
  payload?: T; // 额外的参数
}

// 响应类型定义
export interface ResponseType {
  success: boolean;
  error?: string; // 错误信息
  data?: any; // 可以是任何额外的数据
}

// 向 background.js 发送消息
export function sendMessageToBackground<T>(message: Message<T>): Promise<ResponseType> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: ResponseType) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// 向 content-script 发送消息
export function sendMessageToContent<T>(tabId: number, message: Message<T>): Promise<ResponseType> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: ResponseType) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// 注册消息监听器
export function onMessage(handler: (message: Message, sender: chrome.runtime.MessageSender) => ResponseType | Promise<ResponseType>) {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    const result = handler(message, sender);
    if (result instanceof Promise) {
      result.then(sendResponse).catch((error) => {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
      });
    } else {
      sendResponse(result);
    }
    return true; // 表示异步响应
  });
}

