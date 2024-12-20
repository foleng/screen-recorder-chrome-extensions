import { useSyncExternalStore } from 'react';

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void;

type GetState<T> = () => T;

type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: (listener: () => void) => () => void;
};

function stripFunctions<T>(state: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(state).filter(([_, value]) => typeof value !== 'function')
  ) as Partial<T>;
}

export function createStore<T extends object>(
  createState: StateCreator<T>,
  options: {
    storageKey?: string;  // chrome.storage 中的 key
    syncToStorage?: boolean;  // 是否同步到 storage
  } = {}
): StoreApi<T> {
  const { storageKey, syncToStorage = false } = options;
  let state: T;
  const listeners = new Set<(state: T, prevState: T) => void>();

  // 添加一个简单的订阅函数，用于 useSyncExternalStore
  const subscribe = (listener: () => void) => {
    const wrappedListener = (state: T, prevState: T) => listener();
    listeners.add(wrappedListener);
    return () => listeners.delete(wrappedListener);
  };

  const syncState = (newState: T) => {
    console.log('syncState', newState, syncToStorage, storageKey);
    if (syncToStorage && storageKey) {
      const stateToStore = stripFunctions(newState);
      console.log('stateToStore', stateToStore);
      chrome.storage.local.set({ [storageKey]: stateToStore }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error setting storage:', chrome.runtime.lastError);
        } else {
          console.log('Storage set successfully');
        }
      });
    }
  };

  const setState: SetState<T> = (partial, replace = false) => {
    const nextState = typeof partial === 'function'
      ? (partial as (state: T) => T)(state)
      : partial;

    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace
        ? (nextState as T)
        : Object.assign({}, state, nextState);
      console.log('state', state);
      syncState(state);
    }
  };

  const getState: GetState<T> = () => state;

  const initialize = async () => {
    if (syncToStorage && storageKey) {
      const result = await chrome.storage.local.get(storageKey);
      console.log('result', result);
      if (result[storageKey]) {
        console.log('result[storageKey]', result[storageKey]);
        state = { ...result[storageKey], ...createState(setState, getState) };
      } else {
        console.log('createState');
        state = createState(setState, getState);
        syncState(state);
      }
    } else {
      state = createState(setState, getState);
    }
  };

  const notifyListeners = (state: T, previousState: T) => {
    listeners.forEach(listener => listener(state, previousState));
  }

  // 监听 storage 变化
  if (syncToStorage && storageKey) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[storageKey]) {
        const newState = changes[storageKey].newValue;
        if (!Object.is(newState, state)) {
          const previousState = state;
          state = { ...newState, ...createState(setState, getState) };
          notifyListeners(state, previousState);
        }
      }
    });
  }

  initialize();

  return { setState, getState, subscribe };
}

// 定义 createImpl 函数，接收 createState 函数作为参数
const createImpl = (createState: StateCreator<T>) => {
    // 调用 createStore 函数创建状态管理器
    const api = createStore(createState);
    // 返回一个函数，该函数将 api 对象传递给 useStore 函数
    return (selector: (state: T) => U) => useStore(api, selector)
}

export const create = (createState: StateCreator<T>, selector: (state: T) => U) => createImpl(createState, selector);

// 使用 useSyncExternalStore 的新 hook
export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U = state => state as unknown as U
): U {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()) // 服务端渲染的快照，这里使用同样的值
  );
}

// 创建一个支持异步初始化的 hook
export function useAsyncStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U = state => state as unknown as U,
  fallback: U
): U {
  const selectedState = useStore(store, selector);
  return selectedState ?? fallback;
}

// 创建录制相关的 store
interface RecordingState {
  isRecording: boolean;
  mediaType: MediaType | null;
  recordingTime: number;
  setIsRecording: (isRecording: boolean) => void;
  setMediaType: (mediaType: MediaType | null) => void;
  setRecordingTime: (time: number) => void;
}

export const recordingStore = createStore<RecordingState>(
  (set) => ({
    isRecording: false,
    mediaType: null,
    recordingTime: 0,
    setIsRecording: (isRecording) => set({ isRecording }),
    setMediaType: (mediaType) => set({ mediaType }),
    setRecordingTime: (time) => set({ recordingTime: time }),
  }),
  {
    storageKey: 'recordingState',
    syncToStorage: true
  }
);

// 创建弹窗相关的 store
interface PopupState {
  visible: boolean;
  position: { x: number; y: number };
  setVisible: (visible: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
}

export const popupStore = createStore<PopupState>(
  (set) => ({
    visible: false,
    position: { x: 100, y: 100 },
    setVisible: (visible) => set({ visible }),
    setPosition: (position) => set({ position }),
  }),
  {
    storageKey: 'popupState',
    syncToStorage: true
  }
);
