class CardView {
  constructor({
    cardElement,
    themeElement,
    defaultThemeText = ''
  } = {}) {
    if (!cardElement) {
      throw new Error('cardElement is required');
    }
    this.cardElement = cardElement;
    this.innerElement = cardElement.querySelector('.card__inner') || cardElement;
    this.themeElement = themeElement;
    this.defaultThemeText = defaultThemeText;
    this.animating = false;
  }

  async reveal({ themeText }) {
    if (this.animating) {
      return false;
    }
    this.animating = true;

    if (this.cardElement.classList.contains('card--flipped')) {
      await this._toggleFlip(false);
    }

    if (this.themeElement) {
      this.themeElement.textContent = themeText;
    }

    await this._toggleFlip(true);
    this.animating = false;
    return true;
  }

  async reset({ withAnimation = false } = {}) {
    if (!withAnimation) {
      this.cardElement.classList.remove('card--flipped');
    } else {
      await this._toggleFlip(false);
    }
    if (this.themeElement) {
      this.themeElement.textContent = this.defaultThemeText;
    }
    this.animating = false;
  }

  // Internal helper for the flip animation; underscore keeps it pseudo-private without using class fields.
  async _toggleFlip(flipForward) {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.target !== this.innerElement) {
          return;
        }
        this.innerElement.removeEventListener('transitionend', handler);
        clearTimeout(timeoutId);
        resolve();
      };

      this.innerElement.addEventListener('transitionend', handler);
      const timeoutId = setTimeout(() => {
        this.innerElement.removeEventListener('transitionend', handler);
        resolve();
      }, 900);

      requestAnimationFrame(() => {
        if (flipForward) {
          this.cardElement.classList.add('card--flipped');
        } else {
          this.cardElement.classList.remove('card--flipped');
        }
      });
    });
  }
}

export { CardView };
