// 定义消息类型枚举
export enum MessageTypeEnum {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  GET_STATUS = "GET_STATUS",
  SHOW_RECORDER_POPUP = "SHOW_RECORDER_POPUP",
}

// 消息类型定义
export interface Message<T = Record<string, unknown>> {
  type: MessageTypeEnum;
  payload?: T;
}

// 响应类型定义
export interface ResponseType {
  success: boolean;
  error?: string;
  data?: any;
}

// 定义各种事件的处理函数类型
export type MessageHandler<T = any> = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: T) => void
) => boolean | void;

export type ConnectHandler = (port: chrome.runtime.Port) => void;

export type TabUpdateHandler = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => void;

// 定义处理器类型枚举
export enum HandlerType {
  RUNTIME_MESSAGE = 'runtimeMessage',
  TAB_MESSAGE = 'tabMessage',
  CONNECT = 'connect',
  TAB_UPDATE = 'tabUpdate'
}

// 处理器配置类型
export interface HandlerConfig {
  type: HandlerType;
  eventType: string;
  condition?: (message: any, ...args: any[]) => boolean;
  register: (callback: Function) => void;
}

// 添加回处理器接口
export interface RuntimeMessageHandler {
  handleRuntimeMessage: MessageHandler;
}

export interface TabMessageHandler {
  handleTabMessage: MessageHandler;
}

export interface ConnectHandler {
  handleConnect: (port: chrome.runtime.Port) => void;
}

export interface TabUpdateHandler {
  handleTabUpdate: TabUpdateHandler;
}

// 处理器注册接口
export interface HandlerRegistry {
  type: HandlerType;
  handler: RuntimeMessageHandler | TabMessageHandler | ConnectHandler | TabUpdateHandler;
}
