import store from '@/extensions/store';
import { Message, ResponseType } from '@/utils/messaging';
import { CommandManager } from './command/CommandManager';

const commandManager = new CommandManager();
const handleMessage = async (message: Message, sender, sendResponse) => {
  console.log('Received message:', message);

  const { type, payload } = message || {};
  const response: ResponseType = await commandManager.executeCommand(
    type,
    payload,
  );

  sendResponse(response);
  return true; // 表示异步响应
};

const handleActionClick = (tab) => {
  store.setState({
    popup: true,
  });
  chrome.tabs.create({ url: 'popup.html' });
};

export function initEvents() {
  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.action.onClicked.addListener(handleActionClick);
}
