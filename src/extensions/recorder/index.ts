import { ScreenRecorder } from './screenRecorder';
import { CameraRecorder } from './cameraRecorder';
import { Recorder } from './recorder'; // 基类


export enum MediaType {
  Screen = 'screen',
  Videos = 'videos',
  Camera = 'camera'
}

// 录制器工厂
interface RecorderFactory {
  create(): Recorder;
}

// 具体工厂：屏幕录制器
class ScreenRecorderFactory implements RecorderFactory {
  create(): Recorder {
    return new ScreenRecorder();
  }
}

// 具体工厂：摄像头录制器
class CameraRecorderFactory implements RecorderFactory {
  create(): Recorder {
    return new CameraRecorder();
  }
}

// 单例工厂管理器：用于存储和管理单例实例
class RecorderSingletonManager {
  private static instances: { [key in MediaType]?: Recorder } = {};

  static getInstance(type: MediaType): Recorder | undefined {
    return RecorderSingletonManager.instances[type];
  }

  static setInstance(type: MediaType, instance: Recorder): void {
    RecorderSingletonManager.instances[type] = instance;
  }
}

// 录制器工厂：通过传入的类型选择工厂
class RecorderFactoryProvider {
  private static factories: { [key in MediaType]?: RecorderFactory } = {
    [MediaType.Screen]: new ScreenRecorderFactory(),
    [MediaType.Camera]: new CameraRecorderFactory(),
  };

  static getFactory(type: MediaType): RecorderFactory | undefined {
    return RecorderFactoryProvider.factories[type];
  }
}

// 创建录制器的主函数，支持单例和多例
export const createRecorder = (type: MediaType, useSingleton = false): Recorder => {
  // 如果是单例模式
  if (useSingleton) {
    const existingInstance = RecorderSingletonManager.getInstance(type);
    if (existingInstance) {
      return existingInstance;
    }

    const factory = RecorderFactoryProvider.getFactory(type);
    if (!factory) throw new Error('Unknown recorder type for singleton');

    const instance = factory.create();
    RecorderSingletonManager.setInstance(type, instance);
    return instance;
  }

  // 如果是多例模式
  const factory = RecorderFactoryProvider.getFactory(type);
  if (!factory) throw new Error('Unknown recorder type for multi-instance');

  return factory.create();
};


