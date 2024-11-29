export * from './env';



// 定义 Tab 类型
interface Tab {
  id: number;
  index: number;
  windowId: number;
  // 其他 Tab 属性可以根据需要添加
}

// 获取当前标签页的函数
export const getCurrentTab = async (): Promise<Tab | undefined> => {
  const queryOptions = { active: true, lastFocusedWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab as Tab | undefined; // 使用类型断言
};


// 定义创建标签页的选项接口
interface CreateTabOptions extends chrome.tabs.CreateProperties {}

// 创建新标签页的函数
export const createNewTab = async (options: CreateTabOptions): Promise<chrome.tabs.Tab> => {
  const tab = await chrome.tabs.create(options);
  return tab;
};

// 定义函数重载
export function getQueryParam(): Record<string, string | null>;
export function getQueryParam(param: string): string | null;
export function getQueryParam(param?: string): string | null | Record<string, string | null> {
  const urlParams = new URLSearchParams(window.location.search);

  if (!param) {
    const result: Record<string, string | null> = {};
    urlParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  return urlParams.get(param);
}
