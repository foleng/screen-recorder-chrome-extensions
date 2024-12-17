type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void;

type GetState<T> = () => T;

type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

type StoreApi<T> = {
  setState: SetState<T>;
  getState: GetState<T>;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

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

  // 同步到 chrome.storage
  const syncState = (newState: T) => {
    if (syncToStorage && storageKey) {
      chrome.storage.local.set({ [storageKey]: newState });
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

      // 同步到 storage
      syncState(state);

      // 通知监听器
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState: GetState<T> = () => state;

  const subscribe = (listener: (state: T, prevState: T) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // 初始化状态
  const initialize = async () => {
    if (syncToStorage && storageKey) {
      const result = await chrome.storage.local.get(storageKey);
      if (result[storageKey]) {
        state = result[storageKey];
      } else {
        state = createState(setState, getState);
        syncState(state);
      }
    } else {
      state = createState(setState, getState);
    }
  };

  // 监听 storage 变化
  if (syncToStorage && storageKey) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[storageKey]) {
        const newState = changes[storageKey].newValue;
        if (!Object.is(newState, state)) {
          const previousState = state;
          state = newState;
          listeners.forEach((listener) => listener(state, previousState));
        }
      }
    });
  }

  // 立即初始化
  initialize();

  return { setState, getState, subscribe };
}

// React Hook
import { useEffect, useState } from 'react';

export function useStore<T, U>(
  store: StoreApi<T>,
  selector: (state: T) => U = state => state as unknown as U
): U {
  const [selectedState, setSelectedState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      const newSelectedState = selector(state);
      if (!Object.is(newSelectedState, selector(prevState))) {
        setSelectedState(newSelectedState);
      }
    });
    return unsubscribe;
  }, [store, selector]);

  return selectedState;
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

