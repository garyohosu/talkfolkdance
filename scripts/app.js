import { themes } from '../data/themes.js';
import { revelations } from '../data/revelations.js';
import { StorageService } from './storage-service.js';
import { DeckManager } from './deck-manager.js';
import { RevelationService } from './revelation-service.js';
import { CardView } from './card-view.js';
import { ResetDialog } from './reset-dialog.js';

class AppController {
  constructor() {
    this.totalThemes = themes.length;
    this.handleCardInteraction = this.handleCardInteraction.bind(this);
    this.handleResetButton = this.handleResetButton.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  async init() {
    this.cacheDom();
    this.setupServices();
    await this.cardView.reset();
    this.updateStatusMessage();

    this.cardElement.addEventListener('click', this.handleCardInteraction);
    this.resetButton.addEventListener('click', this.handleResetButton);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    if (this.initialStorageState.wasRecovered) {
      this.showStatus('ストレージを初期化しました。カードをめくり直してください。', { highlight: true });
    }
  }

  cacheDom() {
    this.cardElement = document.querySelector('[data-role="card"]');
    this.themeElement = document.querySelector('[data-role="theme"]');
    this.revelationElement = document.querySelector('[data-role="revelation"]');
    this.statusElement = document.getElementById('statusMessage');
    this.countElement = document.getElementById('countMessage');
    this.resetButton = document.getElementById('resetButton');
    this.resetDialogElement = document.getElementById('resetDialog');

    if (!this.cardElement || !this.themeElement || !this.revelationElement) {
      throw new Error('必要なDOM要素が見つかりませんでした。');
    }
    if (!this.resetButton) {
      throw new Error('リセットボタンが見つかりませんでした。');
    }

    this.cardView = new CardView({
      cardElement: this.cardElement,
      themeElement: this.themeElement,
      revelationElement: this.revelationElement,
      defaultThemeText: 'カードをタップしてテーマを呼び出しましょう。',
      defaultRevelationText: '啓示はまだ静かに眠っています…'
    });

    this.resetDialog = new ResetDialog({
      rootElement: this.resetDialogElement,
      messageElement: document.getElementById('resetDialogMessage'),
      confirmButton: this.resetDialogElement?.querySelector('[data-action="confirm"]') || null,
      cancelButton: this.resetDialogElement?.querySelector('[data-action="cancel"]') || null
    });
  }

  setupServices() {
    this.storageService = new StorageService({ storageKey: 'talkfolkdance.usedThemes', version: 1 });
    this.initialStorageState = this.storageService.loadUsedThemes();
    this.deckManager = new DeckManager({ themes, storageService: this.storageService });
    this.revelationService = new RevelationService({ messages: revelations });
  }

  async handleCardInteraction() {
    if (this.cardView.animating) {
      return;
    }

    if (!this.deckManager.hasRemaining()) {
      await this.handleDeckExhausted();
      return;
    }

    try {
      const theme = this.deckManager.drawNext();
      if (!theme) {
        await this.handleDeckExhausted();
        return;
      }
      const revelation = this.revelationService.getRandom();
      await this.cardView.reveal({ themeText: theme.text, revelationText: revelation });
      this.updateStatusMessage();
      this.showStatus('新しいテーマが現れました。', { transient: true });
    } catch (error) {
      console.error(error);
      this.showStatus('ストレージにアクセスできませんでした。ページをリロードして再試行してください。', { highlight: true });
    }
  }

  async handleDeckExhausted() {
    this.showStatus('全てのテーマを使い切りました。リセットして再開できます。', { highlight: true });
    await this.handleResetRequest({ reason: '全てのテーマを使い切りました。' });
  }

  async handleResetButton() {
    await this.handleResetRequest();
  }

  async handleResetRequest({ force = false, reason } = {}) {
    let confirmed = force;
    if (!confirmed) {
      confirmed = await this.resetDialog.requestConfirmation({
        remainingCount: this.deckManager.remainingCount,
        reason
      });
    }

    if (!confirmed) {
      return;
    }

    this.deckManager.reset();
    await this.cardView.reset({ withAnimation: true });
    this.updateStatusMessage();
    this.showStatus('カードをタップして新しいテーマを呼び出してください。');
  }

  updateStatusMessage() {
    const remaining = this.deckManager.remainingCount;
    const used = this.totalThemes - remaining;
    if (this.countElement) {
      this.countElement.textContent = `使用済み ${used} / ${this.totalThemes} 件　|　残り ${remaining} 件`;
    }

    if (remaining === 0) {
      this.statusElement.textContent = '全てのテーマを使い切りました。リセットして再開できます。';
    } else {
      this.statusElement.textContent = 'カードをめくって次のテーマを受け取りましょう。';
    }
  }

  showStatus(message, { highlight = false, transient = false } = {}) {
    if (!this.statusElement) {
      return;
    }
    this.statusElement.textContent = message;
    this.statusElement.classList.toggle('status--highlight', highlight);
    if (transient) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = setTimeout(() => {
        this.statusElement.classList.remove('status--highlight');
        this.statusElement.textContent = 'カードをめくって次のテーマを受け取りましょう。';
      }, 2500);
    }
  }

  handleResize() {
    if (typeof window === 'undefined') {
      return;
    }
    const unit = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${unit}px`);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new AppController();
  await app.init();
});
