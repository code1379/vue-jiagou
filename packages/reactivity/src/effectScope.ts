export let activeEffectScope;

class EffectScope {
  effects = [];
  parent = null;
  scopes = []; // 父亲用于存储儿子的 effectScope
  constructor(detached) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes.push(this);
    }
  }

  run(fn) {
    try {
      this.parent = activeEffectScope;
      activeEffectScope = this;
      return fn();
    } finally {
      activeEffectScope = this.parent;
      this.parent = null;
    }
  }

  stop() {
    // 让所有的 useEffect 停止收集
    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];
      effect.stop();
    }
    // 停止儿子的 scope 中的 effect
    if (this.scopes.length) {
      for (let i = 0; i < this.scopes.length; i++) {
        const effect = this.scopes[i];
        effect.stop();
      }
    }
  }
}

// 将 effect 放入到当前作用域中
export function recordEffectScope(effect) {
  if (activeEffectScope) {
    activeEffectScope.effects.push(effect);
  }
}

export function effectScope(detached = false) {
  return new EffectScope(detached);
}
