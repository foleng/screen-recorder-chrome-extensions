// 基础类型定义
export enum MessageTypeEnum {
  START_RECORDING = "START_RECORDING",
  STOP_RECORDING = "STOP_RECORDING",
  GET_STATUS = "GET_STATUS",
  SHOW_RECORDER_POPUP = "SHOW_RECORDER_POPUP",
}

export interface Message<T = Record<string, unknown>> {
  type: MessageTypeEnum;
  payload?: T;
}

export interface ResponseType {
  success: boolean;
  error?: string;
  data?: any;
}

// 处理器类型定义
export type MessageHandler<T = any> = (
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: T) => void
) => boolean | void;

export type TabUpdateHandlerFn = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => void;

// 处理器类型枚举
export enum HandlerType {
  RUNTIME_MESSAGE = 'runtimeMessage',
  TAB_MESSAGE = 'tabMessage',
  CONNECT = 'connect',
  TAB_UPDATE = 'tabUpdate'
}

// 处理器接口
export interface BaseHandler {}

export interface RuntimeMessageHandler extends BaseHandler {
  handleRuntimeMessage: MessageHandler;
}

export interface TabMessageHandler extends BaseHandler {
  handleTabMessage: MessageHandler;
}

export interface ConnectHandler extends BaseHandler {
  handleConnect: (port: chrome.runtime.Port) => void;
}

export interface TabUpdateHandler extends BaseHandler {
  handleTabUpdate: TabUpdateHandlerFn;
}

// 配置接口
export interface HandlerConfig {
  type: HandlerType;
  eventType: string;
  condition?: (message: any, ...args: any[]) => boolean;
  register: (callback: Function) => void;
  execute: (handler: BaseHandler, ...args: any[]) => any;
}

export interface HandlerRegistry {
  type: HandlerType;
  handler: BaseHandler;
}
