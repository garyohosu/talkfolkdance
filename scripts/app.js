import { themes } from '../data/themes.js';
import { StorageService } from './storage-service.js';
import { DeckManager } from './deck-manager.js';
import { CardView } from './card-view.js';

class AppController {
  constructor() {
    this.handleCardInteraction = this.handleCardInteraction.bind(this);
    this.handleCardKeydown = this.handleCardKeydown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.deckEmptyMessage = 'すべてのテーマを引き終えました。\nカードをタップして再開しましょう。';
    this.storageErrorMessage = 'ストレージにアクセスできませんでした。\nページを再読み込みして再試行してください。';
  }

  async init() {
    this.cacheDom();
    this.setupServices();
    await this.cardView.reset();

    this.cardElement.addEventListener('click', this.handleCardInteraction);
    this.cardElement.addEventListener('keydown', this.handleCardKeydown);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  cacheDom() {
    this.cardElement = document.querySelector('[data-role="card"]');
    this.themeElement = document.querySelector('[data-role="theme"]');

    if (!this.cardElement || !this.themeElement) {
      throw new Error('必要なDOM要素が見つかりませんでした。');
    }

    this.cardView = new CardView({
      cardElement: this.cardElement,
      themeElement: this.themeElement,
      defaultThemeText: 'カードをタップしてテーマを呼び出しましょう。'
    });
  }

  setupServices() {
    this.storageService = new StorageService({ storageKey: 'talkfolkdance.usedThemes', version: 1 });
    this.deckManager = new DeckManager({ themes, storageService: this.storageService });
  }

  async handleCardInteraction() {
    if (this.cardView.animating) {
      return;
    }

    try {
      if (!this.deckManager.hasRemaining()) {
        await this.cardView.reveal({ themeText: this.deckEmptyMessage });
        this.deckManager.reset();
        return;
      }

      const theme = this.deckManager.drawNext();
      if (!theme) {
        await this.cardView.reveal({ themeText: this.deckEmptyMessage });
        this.deckManager.reset();
        return;
      }

      await this.cardView.reveal({ themeText: theme.text });
    } catch (error) {
      console.error(error);
      await this.cardView.reveal({ themeText: this.storageErrorMessage });
    }
  }

  async handleCardKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    await this.handleCardInteraction();
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
