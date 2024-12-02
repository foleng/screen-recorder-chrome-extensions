import { Message, ResponseType } from "@/utils/messaging";
import { CommandManager } from "./command/CommandManager";
import store from "@/extensions/store";

const commandManager = new CommandManager();

chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
  console.log("Received message:", message);

  const {type, payload} = message || {}
  const response: ResponseType = await commandManager.executeCommand(type, payload);

  sendResponse(response);
  return true; // 表示异步响应
});

// 设置全局状态
// 轮询改变状态
setInterval(() => {
  store.setState({ count: (store.getState().count || 0) + 1 });
  // store.setState({ user: { name: (store.getState().count || 0) + 1, age: 25 } });
}, 1000);

// 获取状态
console.log(store.getState());

function updateBadge(count) {
  chrome.action.setBadgeText({ text: `59:59` }); // 设置徽标数
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // 设置徽标背景色
}

// 订阅状态变化
const unsubscribe = store.subscribe((state) => {
  console.log("State changed:", state);
  updateBadge(state.count || 0)
});

// 在需要的时候取消订阅
// unsubscribe();
