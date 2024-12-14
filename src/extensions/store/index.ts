// 定义 State 接口
interface State {
  [key: string]: any;  // 或者定义具体的状态结构
}

// 定义 Subscriber 类型
type Subscriber = (state: State) => void;

// 定义 Store 接口
interface Store {
  state: State;
  subscribers: Subscriber[];
  initialize: () => void;
  setState: (newState: Partial<State>) => void;
  getState: () => State;
  subscribe: (callback: Subscriber) => () => void;
  notifySubscribers: () => void;
}

const store: Store = {
  state: {}, // 这里存储当前的状态
  subscribers: [], // 存储所有的订阅者

  // 初始化时从 chrome.storage 获取状态
  initialize() {
    chrome.storage.local.get('zustandState', (result) => {
      if (result.zustandState) {
        this.state = result.zustandState;
        this.notifySubscribers();
      } else {
        this.state = {}; // 默认状态
      }
    });

    // 监听 chrome.storage.local 的变化
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.zustandState) {
        this.state = changes.zustandState.newValue;
        this.notifySubscribers();
      }
    });
  },

  // 更新状态并同步到 chrome.storage.local
  setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };
    chrome.storage.local.set({ zustandState: this.state }, () => {
      this.notifySubscribers(); // 更新后通知所有订阅者
    });
  },

  // 获取当前的状态
  getState() {
    return this.state;
  },

  // 订阅状态变化
  subscribe(callback: Subscriber) {
    this.subscribers.push(callback);
    // 初始时立即调用一次
    callback(this.state);
    return () => {
      // 退订机制
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  },

  // 通知所有订阅者
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  },
};

// 初始化 store
store.initialize();

export default store;

