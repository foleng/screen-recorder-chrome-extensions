import { createStore } from '@/extensions/store';

type RecordingState = 'IDLE' | 'PENDING' | 'RECORDING' | 'PAUSED' | 'STOPPED';

type RecordingEvent = 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'IDLE' | 'CANCEL' | 'CONFIRM';

export interface StateMachine {
  currentState: RecordingState;
  transition: (event: RecordingEvent) => void;
  on: (listener: (state: string) => void) => void;
}

type StateTransitions = {
  [K in RecordingState]: {
    [E in RecordingEvent]?: () => void;
  };
};

const store = createStore<{
  recordingState: RecordingState;
}>(
  () => ({
    recordingState: 'IDLE',
  }),
  {
    storageKey: 'recordingState',
    syncToStorage: true,
  },
);

const recordingStateMachine = async (): Promise<StateMachine> => {
  await store.ready();
  console.log('store', store.getState());
  // 使用代理来跟踪 currentState 的变化
  const stateProxy = new Proxy(
    {
      _currentState: store.getState()?.recordingState ?? 'IDLE',
      get currentState(): RecordingState {
        console.log('get currentState', this._currentState);
        return this._currentState as RecordingState;
      },
    },
    {
      set(target: any, prop, value) {
        console.log('set', target, prop, value);
        if (prop === 'currentState') {
          target._currentState = value;
          // 当状态改变时，同步到 store
          store.setState((state) => ({
            ...state,
            recordingState: value,
          }));
        }
        return true;
      },
    },
  );

  // 定义状态转换规则
  const transitions: StateTransitions = {
    IDLE: {
      START: () => {
        console.log('准备开始录音');
        stateProxy.currentState = 'PENDING';
      },
    },
    PENDING: {
      CONFIRM: () => {
        console.log('用户确认分享');
        stateProxy.currentState = 'RECORDING';
      },
      CANCEL: () => {
        console.log('用户取消分享');
        stateProxy.currentState = 'IDLE';
      }
    },
    RECORDING: {
      PAUSE: () => {
        console.log('暂停录音');
        stateProxy.currentState = 'PAUSED';
      },
      STOP: () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      },
    },
    PAUSED: {
      RESUME: () => {
        console.log('恢复录音');
        stateProxy.currentState = 'RECORDING';
      },
      STOP: () => {
        console.log('停止录音');
        stateProxy.currentState = 'STOPPED';
      },
    },
    STOPPED: {
      START: () => {
        console.log('重新开始录音');
        stateProxy.currentState = 'PENDING';
      },
      IDLE: () => {
        console.log('重置状态');
        stateProxy.currentState = 'IDLE';
      }
    },
  };

  const transition = (event: RecordingEvent) => {
    const stateTransitions = transitions[stateProxy.currentState as RecordingState];
    if (stateTransitions && stateTransitions[event]) {
      stateTransitions[event]();
    } else {
      console.warn(
        `无法在当前状态 ${stateProxy.currentState} 执行事件 ${event}`,
      );
    }
  };

  // 监听录制状态
  const on = (listener: (state: string) => void): void => {
    store.subscribe((state) => {
      if (state.recordingState) {
        listener(state.recordingState);
      }
    });
  };

  return {
    get currentState() {
      return stateProxy.currentState;
    },
    transition,
    on,
  };
};

export default recordingStateMachine;
