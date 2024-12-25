import { useSyncExternalStore } from 'react';
import { MediaType } from '../recorder';

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean,
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
    Object.entries(state).filter(([_, value]) => typeof value !== 'function'),
  ) as Partial<T>;
}

export function createStore<T extends object>(
  createState: StateCreator<T>,
  options: {
    storageKey?: string; // chrome.storage 中的 key
    syncToStorage?: boolean; // 是否同步到 storage
  } = {},
): StoreApi<T> {
  const { storageKey, syncToStorage = false } = options;
  let state: T;
  const listeners = new Set<(state: T, prevState: T) => void>();

  // 添加初始化状态控制
  let resolveInitialize: () => void;
  const initializePromise = new Promise<void>((resolve) => {
    resolveInitialize = resolve;
  });

  // 添加一个简单的订阅函数，用于 useSyncExternalStore
  const subscribe = (listener: (state: T, prevState: T) => void) => {
    const wrappedListener = (state: T, prevState: T) =>
      listener(state, prevState);
    listeners.add(wrappedListener);
    return () => listeners.delete(wrappedListener);
  };

  const syncState = (newState: T) => {
    if (syncToStorage && storageKey) {
      const stateToStore = stripFunctions(newState);
      chrome.storage.local.set({ [storageKey]: stateToStore });
    }
  };

  const setState: SetState<T> = (partial, replace = false) => {
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => T)(state)
        : partial;
    if (!Object.is(nextState, state)) {
      state = replace ? (nextState as T) : Object.assign({}, state, nextState);
      syncState(state);
    }
  };

  const getState: GetState<T> = () => state;

  const initialize = async () => {
    if (syncToStorage && storageKey) {
      const result = await chrome.storage.local.get(storageKey);
      if (result[storageKey]) {
        state = { ...createState(setState, getState), ...result[storageKey] };
      } else {
        state = createState(setState, getState);
        syncState(state);
      }
    } else {
      state = createState(setState, getState);
    }
    resolveInitialize();
  };

  const notifyListeners = (state: T, previousState: T) => {
    listeners.forEach((listener) => listener(state, previousState));
  };

  let storageListener: ((changes: object, areaName: string) => void) | null =
    null;

  // 监听 storage 变化
  if (syncToStorage && storageKey) {
    // 移除之前的监听器（如果存在）
    if (storageListener) {
      chrome.storage.onChanged.removeListener(storageListener);
    }

    // 创建新的监听器
    storageListener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      // 只处理与当前 store 相关的 key 的变化
      if (areaName === 'local' && changes[storageKey]) {
        const newValue = changes[storageKey].newValue;
        // 避免不必要的更新
        if (!Object.is(newValue, stripFunctions(state))) {
          const previousState = state;
          state = { ...createState(setState, getState), ...newValue };
          notifyListeners(state, previousState);
        }
      }
    };

    // 添加监听器
    chrome.storage.onChanged.addListener(storageListener);
  }

  initialize();

  return { setState, getState, subscribe, ready: () => initializePromise };
}

// 使用 useSyncExternalStore 的新 hook
export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U = (state) => state as unknown as U,
): U {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()), // 服���端渲染的快照，这里使用同样的值
  );
}

// 定义 createImpl 函数，接收 createState 函数作为参数
const createImpl = (createState: StateCreator<T>) => {
  // 调用 createStore 函数创建状态管理器
  const api = createStore(createState);
  // 返回一个函数，该函数将 api 对象传递给 useStore 函数
  return (selector: (state: T) => U) => useStore(api, selector);
};

export const create = (
  createState: StateCreator<T>,
  selector: (state: T) => U,
) => createImpl(createState, selector);



// 创建一个支持异步初始化的 hook
export function useAsyncStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U = (state) => state as unknown as U,
  fallback: U,
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
    syncToStorage: true,
  },
);

console.log('recordingStore', recordingStore.getState());

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
    syncToStorage: true,
  },
);
