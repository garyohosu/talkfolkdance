class ResetDialog {
  constructor({
    rootElement,
    messageElement,
    confirmButton,
    cancelButton
  } = {}) {
    this.rootElement = rootElement;
    this.messageElement = messageElement || (rootElement ? rootElement.querySelector('[data-role="message"]') : null);
    this.confirmButton = confirmButton || (rootElement ? rootElement.querySelector('[data-action="confirm"]') : null);
    this.cancelButton = cancelButton || (rootElement ? rootElement.querySelector('[data-action="cancel"]') : null);
    this.activeResolver = null;
    this.useNativeDialog = !this.rootElement;

    if (this.rootElement) {
      this.#attachHandlers();
      this.close();
    }
  }

  requestConfirmation({ remainingCount, reason } = {}) {
    if (this.useNativeDialog) {
      const message = reason || '全てのテーマをリセットしますか？';
      return Promise.resolve(window.confirm(message));
    }

    if (this.activeResolver) {
      this.close();
    }

    if (this.messageElement) {
      const countText = typeof remainingCount === 'number'
        ? `（残り ${remainingCount} 件）`
        : '';
      const reasonText = reason ? `\n${reason}` : '';
      this.messageElement.textContent = `全てのテーマをリセットしますか？${countText}${reasonText}`;
    }

    this.rootElement.removeAttribute('hidden');
    this.rootElement.setAttribute('aria-hidden', 'false');
    this.rootElement.classList.add('reset-dialog--open');

    if (this.confirmButton) {
      this.confirmButton.focus({ preventScroll: true });
    }

    return new Promise((resolve) => {
      this.activeResolver = resolve;
    });
  }

  close(result = false) {
    if (this.rootElement) {
      this.rootElement.setAttribute('aria-hidden', 'true');
      this.rootElement.setAttribute('hidden', 'hidden');
      this.rootElement.classList.remove('reset-dialog--open');
    }
    if (this.activeResolver) {
      const resolver = this.activeResolver;
      this.activeResolver = null;
      resolver(result);
    }
  }

  #attachHandlers() {
    if (this.confirmButton) {
      this.confirmButton.addEventListener('click', () => this.close(true));
    }
    if (this.cancelButton) {
      this.cancelButton.addEventListener('click', () => this.close(false));
    }
    this.rootElement.addEventListener('click', (event) => {
      if (event.target === this.rootElement || event.target.classList.contains('reset-dialog__backdrop')) {
        this.close(false);
      }
    });
  }
}

export { ResetDialog };
