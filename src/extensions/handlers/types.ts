// 定义消息类型枚举
export enum MessageTypeEnum {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  GET_STATUS = "GET_STATUS",
  // 弹窗
  SHOW_RECORDER_POPUP = "SHOW_RECORDER_POPUP",
}

// 消息类型定义
export interface Message<T = Record<string, unknown>> {
  type: MessageTypeEnum;
  payload?: T; // 额外的参数
}

// 响应类型定义
export interface ResponseType {
  success: boolean;
  error?: string; // 错误信息
  data?: any; // 可以是任何额外的数据
}

// 定义不同类型的监听器接口
export interface RuntimeMessageHandler {
  handleRuntimeMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean;
}

export interface TabMessageHandler {
  handleTabMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseType) => void
  ): boolean;
}

export interface ConnectHandler {
  handleConnect(port: chrome.runtime.Port): void;
}

export interface TabUpdateHandler {
  handleTabUpdate(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): void;
}

// 定义处理器类型枚举
export enum HandlerType {
  RUNTIME_MESSAGE = 'runtimeMessage',
  TAB_MESSAGE = 'tabMessage',
  CONNECT = 'connect',
  TAB_UPDATE = 'tabUpdate'
}

// 处理器注册接口
export interface HandlerRegistry {
  type: HandlerType;
  handler: RuntimeMessageHandler | TabMessageHandler | ConnectHandler | TabUpdateHandler;
}
