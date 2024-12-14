import {
  Message,
  ResponseType,
  MessageTypeEnum,
  HandlerType,
  MessageHandler,
  ConnectHandler,
  TabUpdateHandler,
  HandlerConfig,
  HandlerRegistry,
  RuntimeMessageHandler,
  TabMessageHandler
} from './types';

class MessageService {
  private static listeners: Map<string, Set<Function>> = new Map();
  private static handlers: {
    [HandlerType.RUNTIME_MESSAGE]: RuntimeMessageHandler[];
    [HandlerType.TAB_MESSAGE]: TabMessageHandler[];
    [HandlerType.CONNECT]: ConnectHandler[];
    [HandlerType.TAB_UPDATE]: TabUpdateHandler[];
  } = {
    [HandlerType.RUNTIME_MESSAGE]: [],
    [HandlerType.TAB_MESSAGE]: [],
    [HandlerType.CONNECT]: [],
    [HandlerType.TAB_UPDATE]: [],
  };

  private static handlerConfigs: { [key in HandlerType]: HandlerConfig } = {
    [HandlerType.RUNTIME_MESSAGE]: {
      type: HandlerType.RUNTIME_MESSAGE,
      eventType: 'onMessage',
      condition: (message: Message, type: string) => message.type === type,
      register: (callback) => chrome.runtime.onMessage.addListener(callback)
    },
    [HandlerType.TAB_MESSAGE]: {
      type: HandlerType.TAB_MESSAGE,
      eventType: 'onMessage',
      condition: (message: Message, type: string, sender) =>
        message.type === type && !!sender.tab,
      register: (callback) => chrome.runtime.onMessage.addListener(callback)
    },
    [HandlerType.CONNECT]: {
      type: HandlerType.CONNECT,
      eventType: 'onConnect',
      condition: (port: chrome.runtime.Port, name: string) => port.name === name,
      register: (callback) => chrome.runtime.onConnect.addListener(callback)
    },
    [HandlerType.TAB_UPDATE]: {
      type: HandlerType.TAB_UPDATE,
      eventType: 'onUpdated',
      register: (callback) => chrome.tabs.onUpdated.addListener(callback)
    }
  };

  // 注册处理器
  static registerHandler(registry: HandlerRegistry): void {
    const { type, handler } = registry;
    switch (type) {
      case HandlerType.RUNTIME_MESSAGE:
        this.handlers[HandlerType.RUNTIME_MESSAGE].push(handler as RuntimeMessageHandler);
        break;
      case HandlerType.TAB_MESSAGE:
        this.handlers[HandlerType.TAB_MESSAGE].push(handler as TabMessageHandler);
        break;
      case HandlerType.CONNECT:
        this.handlers[HandlerType.CONNECT].push(handler as ConnectHandler);
        break;
      case HandlerType.TAB_UPDATE:
        this.handlers[HandlerType.TAB_UPDATE].push(handler as TabUpdateHandler);
        break;
    }
  }

  // 批量注册处理器
  static registerHandlers(registries: HandlerRegistry[]): void {
    registries.forEach(registry => this.registerHandler(registry));
  }

  // 修改 addListener 方法以支持 handlers
  private static addListener(
    handlerType: HandlerType,
    eventType: string,
    callback: Function
  ): () => void {
    const key = `${handlerType}:${eventType}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());

      const config = this.handlerConfigs[handlerType];
      const wrappedCallback = (...args: any[]) => {
        const listeners = this.listeners.get(key);
        if (!listeners) return false;

        let keepChannelOpen = false;

        // 先执行注册的 handlers
        if (handlerType === HandlerType.RUNTIME_MESSAGE) {
          const message = args[0] as Message;
          if (message.type === eventType) {
            for (const handler of this.handlers[HandlerType.RUNTIME_MESSAGE]) {
              const result = handler.handleRuntimeMessage(...args);
              if (result === true) keepChannelOpen = true;
            }
          }
        }
        // 处理 TAB_MESSAGE 类型的 handlers
        if (handlerType === HandlerType.TAB_MESSAGE) {
          const message = args[0] as Message;
          if (message.type === eventType) {
            for (const handler of this.handlers[HandlerType.TAB_MESSAGE]) {
              const result = handler.handleTabMessage(...args);
              if (result === true) keepChannelOpen = true;
            }
          }
        }

        // 处理 CONNECT 类型的 handlers
        if (handlerType === HandlerType.CONNECT) {
          const port = args[0] as chrome.runtime.Port;
          if (port.name === eventType) {
            for (const handler of this.handlers[HandlerType.CONNECT]) {
              handler.handleConnect(port);
            }
          }
        }

        // 处理 TAB_UPDATE 类型的 handlers
        if (handlerType === HandlerType.TAB_UPDATE) {
          const [tabId, changeInfo, tab] = args;
          if (changeInfo.status === eventType) {
            for (const handler of this.handlers[HandlerType.TAB_UPDATE]) {
              handler.handleTabUpdate(tabId, changeInfo, tab);
            }
          }
        }

        // 然后执行动态添加的监听器
        if (!config.condition || config.condition(...args, eventType)) {
          listeners.forEach(listener => {
            const result = listener(...args);
            if (result === true) keepChannelOpen = true;
          });
        }

        return keepChannelOpen;
      };

      config.register(wrappedCallback);
    }

    const listeners = this.listeners.get(key)!;
    listeners.add(callback);

    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  // 公共 API
  static onRuntimeMessage<T = any>(
    messageType: MessageTypeEnum,
    callback: MessageHandler<T>
  ): () => void {
    return this.addListener(HandlerType.RUNTIME_MESSAGE, messageType, callback);
  }

  static onTabMessage<T = any>(
    messageType: MessageTypeEnum,
    callback: MessageHandler<T>
  ): () => void {
    return this.addListener(HandlerType.TAB_MESSAGE, messageType, callback);
  }

  static onConnect(
    portName: string,
    callback: ConnectHandler
  ): () => void {
    return this.addListener(HandlerType.CONNECT, portName, callback);
  }

  static onTabUpdate(
    eventType: string,
    callback: TabUpdateHandler
  ): () => void {
    return this.addListener(HandlerType.TAB_UPDATE, eventType, callback);
  }

  // 发送消息方法
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

  static sendTabMessage<T extends ResponseType = ResponseType>(
    tabId: number,
    message: Message,
    callback?: (response: T) => void
  ) {
    chrome.tabs.sendMessage(tabId, message, (response: T) => {
      if (callback) callback(response);
    });
  }
}

export default MessageService;

