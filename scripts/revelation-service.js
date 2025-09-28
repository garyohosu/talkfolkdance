const DEFAULT_FALLBACK = '静けさが次の啓示を温めている…';

class RevelationService {
  constructor({ messages = [] } = {}) {
    this.messages = messages
      .filter((message) => typeof message === 'string' && message.trim().length > 0)
      .map((message) => message.trim());
    this.fallback = DEFAULT_FALLBACK;
  }

  getRandom() {
    if (this.messages.length === 0) {
      return this.fallback;
    }
    const index = Math.floor(Math.random() * this.messages.length);
    return this.messages[index];
  }
}

export { RevelationService };
