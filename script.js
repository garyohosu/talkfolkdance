import topics from './topics.js';

const defaultTopicText = 'カードをタップしてトークテーマを表示しましょう。';
const fallbackTopicText = 'トークテーマがまだ登録されていません。';
const animationTimeoutMs = 900;

function pickRandomTopic() {
  if (!Array.isArray(topics) || topics.length === 0) {
    return fallbackTopicText;
  }
  const index = Math.floor(Math.random() * topics.length);
  const candidate = topics[index];
  if (typeof candidate !== 'string') {
    return fallbackTopicText;
  }
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : fallbackTopicText;
}

function createFlipController(cardElement) {
  const inner = cardElement.querySelector('.card__inner') || cardElement;
  let animating = false;

  const toggleFlip = (flipForward) => {
    return new Promise((resolve) => {
      const cleanup = () => {
        inner.removeEventListener('transitionend', handle);
        clearTimeout(timeoutId);
        resolve();
      };

      const handle = (event) => {
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
    async reveal(updateText) {
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

function setupApp() {
  const cardElement = document.querySelector('[data-role="card"]');
  const themeElement = document.querySelector('[data-role="theme"]');

  if (!cardElement || !themeElement) {
    throw new Error('必要な要素が見つかりませんでした。');
  }

  if (!themeElement.textContent || themeElement.textContent.trim().length === 0) {
    themeElement.textContent = defaultTopicText;
  }

  const flipController = createFlipController(cardElement);

  const handleInteraction = async () => {
    const nextTopic = pickRandomTopic();
    await flipController.reveal(() => {
      themeElement.textContent = nextTopic;
    });
  };

  const triggerInteraction = (source) => {
    console.debug('[TalkFolkDance] card interaction', source);
    handleInteraction();
  };

  const handleClick = (event) => {
    if (typeof event.button === 'number' && event.button !== 0) {
      return;
    }
    triggerInteraction(event.type);
  };

  const handleTouchStart = (event) => {
    event.preventDefault();
    triggerInteraction(event.type);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') {
      return;
    }
    event.preventDefault();
    triggerInteraction(`${event.type}:${event.pointerType}`);
  };

  if (window.PointerEvent) {
    cardElement.addEventListener('pointerdown', handlePointerDown);
    cardElement.addEventListener('click', handleClick);
  } else {
    ['click', 'touchstart'].forEach((eventName) => {
      const handler = eventName === 'click' ? handleClick : handleTouchStart;
      cardElement.addEventListener(eventName, handler);
    });
  }

  cardElement.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    handleInteraction();
  });

  const updateVhUnit = () => {
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
