import { topics } from '../data/topics.js';
import { CardView } from './card-view.js';

const defaultThemeText = 'カードをタップしてトークテーマを表示しましょう。';
const fallbackThemeText = 'トークテーマがまだ登録されていません。';

class AppController {
  constructor() {
    this.handleCardInteraction = this.handleCardInteraction.bind(this);
    this.handleCardKeydown = this.handleCardKeydown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.topicTexts = topics
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return entry;
        }
        if (entry && typeof entry.text === 'string') {
          return entry.text;
        }
        console.warn(`Invalid topic entry at index ${index}.`);
        return '';
      })
      .filter((text) => text.trim().length > 0);
  }

  async init() {
    this.cacheDom();
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
      defaultThemeText
    });
  }

  async handleCardInteraction() {
    if (this.cardView.animating) {
      return;
    }

    const themeText = this._pickTopicText();
    await this.cardView.reveal({ themeText });
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

  _pickTopicText() {
    if (this.topicTexts.length === 0) {
      return fallbackThemeText;
    }
    const index = Math.floor(Math.random() * this.topicTexts.length);
    return this.topicTexts[index];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new AppController();
  await app.init();
});
