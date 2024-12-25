import { recordingStore } from '@/extensions/store';

export class IconManager {
  private timer: number | null = null;

  constructor() {
    this.resetBadge();

    recordingStore.subscribe((state) => {
      if (state.recordingTime > 0) {
        this.updateBadge(state.recordingTime);
      } else {
        this.resetBadge();
      }
    });
  }

  public startTimer(): void {
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }

  public stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.resetBadge();
  }

  private updateBadge(seconds: number): void {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    chrome.action.setBadgeText({ text: timeString });
  }

  private resetBadge(): void {
    chrome.action.setBadgeText({ text: '' });
  }
}
