// @ts-ignore
import { topics } from './topics.js';

const defaultTopicText = 'カードをタップしてトークテーマを表示しましょう。';
const fallbackTopicText = 'トークテーマがまだ登録されていません。';
const animationTimeoutMs = 900;

class TopicManager {
  private availableTopics: string[] = [];
  private usedTopics: string[] = [];
  
  constructor(private allTopics: string[]) {
    this.reset();
  }
  
  private reset(): void {
    this.availableTopics = [...this.allTopics];
    this.usedTopics = [];
  }
  
  getNextTopic(): string {
    if (!Array.isArray(this.allTopics) || this.allTopics.length === 0) {
      return fallbackTopicText;
    }
    
    // 全て使い切った場合はリセット
    if (this.availableTopics.length === 0) {
      this.reset();
    }
    
    const randomIndex = Math.floor(Math.random() * this.availableTopics.length);
    const selectedTopic = this.availableTopics[randomIndex];
    
    // 使用済みに移動
    this.availableTopics.splice(randomIndex, 1);
    this.usedTopics.push(selectedTopic);
    
    if (typeof selectedTopic !== 'string') {
      return fallbackTopicText;
    }
    
    const trimmed = selectedTopic.trim();
    return trimmed.length > 0 ? trimmed : fallbackTopicText;
  }
  
  getRemainingCount(): number {
    return this.availableTopics.length;
  }
  
  getTotalCount(): number {
    return this.allTopics.length;
  }
}

interface FlipController {
  isAnimating(): boolean;
  reveal(updateText?: () => void): Promise<void>;
}

function createFlipController(cardElement: HTMLElement): FlipController {
  const inner = cardElement.querySelector('.card__inner') as HTMLElement || cardElement;
  let animating = false;

  const toggleFlip = (flipForward: boolean): Promise<void> => {
    return new Promise((resolve) => {
      const cleanup = () => {
        inner.removeEventListener('transitionend', handle);
        clearTimeout(timeoutId);
        resolve();
      };

      const handle = (event: TransitionEvent) => {
        if (event.target !== inner) {
          return;
        }
        cleanup();
      };

      inner.addEventListener('transitionend', handle);
      const timeoutId = setTimeout(cleanup, animationTimeoutMs);

      requestAnimationFrame(() => {
        if (flipForward) {
          cardElement.classList.add('card--flipped');
        } else {
          cardElement.classList.remove('card--flipped');
        }
      });
    });
  };

  return {
    isAnimating: () => animating,
    async reveal(updateText?: () => void): Promise<void> {
      if (animating) {
        return;
      }
      animating = true;
      try {
        if (cardElement.classList.contains('card--flipped')) {
          await toggleFlip(false);
        }
        if (typeof updateText === 'function') {
          updateText();
        }
        await toggleFlip(true);
      } finally {
        animating = false;
      }
    }
  };
}

function setupApp(): void {
  const cardElement = document.querySelector('[data-role="card"]') as HTMLElement;
  const themeElement = document.querySelector('[data-role="theme"]') as HTMLElement;

  if (!cardElement || !themeElement) {
    throw new Error('必要な要素が見つかりませんでした。');
  }

  if (!themeElement.textContent || themeElement.textContent.trim().length === 0) {
    themeElement.textContent = defaultTopicText;
  }

  const topicManager = new TopicManager(topics);
  const flipController = createFlipController(cardElement);

  const handleInteraction = async (): Promise<void> => {
    const nextTopic = topicManager.getNextTopic();
    await flipController.reveal(() => {
      themeElement.textContent = nextTopic;
    });
  };

  cardElement.addEventListener('click', handleInteraction);
  cardElement.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    handleInteraction();
  });

  const updateVhUnit = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    const unit = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${unit}px`);
  };

  updateVhUnit();
  window.addEventListener('resize', updateVhUnit);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupApp);
} else {
  setupApp();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/talkfolkdance/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}
