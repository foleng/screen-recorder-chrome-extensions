import {
  Message,
  ResponseType,
  MessageTypeEnum,
  HandlerType,
  MessageHandler,
  HandlerConfig,
  HandlerRegistry,
  BaseHandler
} from './types';

class MessageService {
  private static listeners: Map<string, Set<Function>> = new Map();
  private static handlers: Map<HandlerType, BaseHandler[]> = new Map(
    Object.values(HandlerType).map(type => [type, []])
  );

  private static handlerConfigs: Record<HandlerType, HandlerConfig> = {
    [HandlerType.RUNTIME_MESSAGE]: {
      type: HandlerType.RUNTIME_MESSAGE,
      eventType: 'onMessage',
      condition: (message: Message, type: MessageTypeEnum) => message.type === type,
      register: (callback) => chrome.runtime.onMessage.addListener(callback),
      execute: (handler, ...args) => (handler as RuntimeMessageHandler).handleRuntimeMessage(...args)
    },
    [HandlerType.TAB_MESSAGE]: {
      type: HandlerType.TAB_MESSAGE,
      eventType: 'onMessage',
      condition: (message: Message, type: MessageTypeEnum, sender: chrome.runtime.MessageSender) =>
        message.type === type && !!sender?.tab,
      register: (callback) => chrome.runtime.onMessage.addListener(callback),
      execute: (handler, ...args) => (handler as TabMessageHandler).handleTabMessage(...args)
    },
    [HandlerType.CONNECT]: {
      type: HandlerType.CONNECT,
      eventType: 'onConnect',
      condition: (port: chrome.runtime.Port, name: string) => port.name === name,
      register: (callback) => chrome.runtime.onConnect.addListener(callback),
      execute: (handler, port) => (handler as ConnectHandler).handleConnect(port)
    },
    [HandlerType.TAB_UPDATE]: {
      type: HandlerType.TAB_UPDATE,
      eventType: 'onUpdated',
      register: (callback) => chrome.tabs.onUpdated.addListener(callback),
      execute: (handler, ...args) => (handler as TabUpdateHandler).handleTabUpdate(...args)
    },
    [HandlerType.ALL_MESSAGE]: {
      type: HandlerType.ALL_MESSAGE,
      eventType: 'onMessage',
      condition: (message: Message, type: MessageTypeEnum) => message.type === type,
      register: (callback) => chrome.runtime.onMessage.addListener(callback),
      execute: (handler, ...args) => (handler as MessageHandler).handleMessage(...args)
    }
  };

  // 注册处理器
  static registerHandler(registry: HandlerRegistry): void {
    const handlers = this.handlers.get(registry.type) || [];
    handlers.push(registry.handler);
    this.handlers.set(registry.type, handlers);

    // 初始化对应类型的监听器
    const config = this.handlerConfigs[registry.type];
    const key = `${registry.type}:${registry.eventType}`;

    // 如果该类型的监听器还没有被初始化，则初始化它
    if (!this.listeners.has(key)) {
      this.addListener(registry.type, registry.eventType, () => {});
    }
  }

  static registerHandlers(registries: HandlerRegistry[]): void {
    registries.forEach(registry => this.registerHandler(registry));
  }

  private static addListener(
    handlerType: HandlerType,
    eventType: MessageTypeEnum,
    callback: Function
  ): () => void {
    const key = `${handlerType}:${eventType}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());

      const config = this.handlerConfigs[handlerType];
      const wrappedCallback = (...args: any[]) => {
        const listeners = this.listeners.get(key);
        if (!listeners) {
          return false;
        }

        let keepChannelOpen = false;

        // 执行注册的 handlers
        const handlers = this.handlers.get(handlerType) || [];
        if (handlers.length && (!config.condition || config.condition(args[0], eventType, ...args.slice(1)))) {
          for (const handler of handlers) {
            const result = config.execute(handler, ...args);
            if (result === true) keepChannelOpen = true;
          }
        }

        // 执行动态添加的监听器
        if (!config.condition || config.condition(args[0], eventType, ...args.slice(1))) {
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

  static onMessage<T = any>(
    messageType: MessageTypeEnum,
    callback: MessageHandler<T>
  ): () => void {
    return this.addListener(HandlerType.ALL_MESSAGE, messageType, callback);
  }

  // 发送消息方法
  static sendMessage<T extends ResponseType = ResponseType>(
    type: MessageTypeEnum,
    payload?: Record<string, unknown>,
    options?: {
      callback?: (response: T) => void;
      target?: 'runtime' | 'tabs';
      tabId?: number;
    }
  ): void {
    const message: Message = { type, payload };
    const { callback, target = 'runtime', tabId } = options || {};
    if (target === 'tabs' && tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, message, callback);
    } else {
      chrome.runtime.sendMessage(message, callback);
    }
  }

  static sendRuntimeMessage<T extends ResponseType = ResponseType>(
    type: MessageTypeEnum,
    payload?: Record<string, unknown>,
    callback?: (response: T) => void
  ): void {
    const message: Message = { type, payload };
    chrome.runtime.sendMessage(message, callback);
  };

  // 发送消息到特定标签页
  static sendTabMessage<T extends ResponseType = ResponseType>(
    tabId: number,
    type: MessageTypeEnum,
    payload?: Record<string, unknown>,
    callback?: (response: T) => void
  ): void {
    const message: Message = { type, payload };
    chrome.tabs.sendMessage(tabId, message, callback);
  }
}

export default MessageService;

