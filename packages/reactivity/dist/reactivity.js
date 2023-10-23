// packages/reactivity/src/effect.ts
var activeEffect = void 0;
function cleanupEffect(effect2) {
  let deps = effect2.deps;
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  // ! effect 重要记录那些属性在 effect 中调用
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.parent = void 0;
    this.deps = [];
  }
  run() {
    try {
      this.parent = activeEffect;
      activeEffect = this;
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
    }
  }
};
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  return runner;
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isFunction(value) {
  return typeof value === "function";
}

// packages/reactivity/src/baseHandler.ts
var mutableHandler = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    let value = Reflect.get(target, key, receiver);
    if (isObject(value)) {
      value = reactive(value);
    }
    return value;
  },
  set(target, key, value, receiver) {
    let oldVal = target[key];
    let flag = Reflect.set(target, key, value, receiver);
    if (value !== oldVal) {
      trigger(target, key, value, oldVal);
    }
    return flag;
  }
};
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffects(dep);
  }
}
function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const effects = depsMap.get(key);
  triggerEffects(effects);
}
function triggerEffects(effects) {
  if (effects) {
    [...effects].forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }
}

// packages/reactivity/src/reactive.ts
function reactive(target) {
  return createReactiveObject(target);
}
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target)) {
    return;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  let existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandler);
  reactiveMap.set(target, proxy);
  return proxy;
}
function isReactive(source) {
  return !!(source && source["__v_isReactive" /* IS_REACTIVE */]);
}

// packages/reactivity/src/computed.ts
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this._dirty = true;
    this.dep = /* @__PURE__ */ new Set();
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
      triggerEffects(this.dep);
    });
  }
  // * get value 收集的是 effect(() => { console.log(fullname.value)})
  get value() {
    if (activeEffect) {
      trackEffects(this.dep);
    }
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(val) {
    this.setter(val);
  }
};
function computed(getterOrOptions) {
  let getter;
  let setter;
  const isGetter = isFunction(getterOrOptions);
  if (isGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn("comnputed is readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/watch.ts
function traverse(source, seen = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (seen.has(source)) {
    return source;
  }
  seen.add(source);
  for (let k in source) {
    traverse(source[k], seen);
  }
  return source;
}
function watch(source, cb, options = {}) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  let clean;
  const onCleanUp = (fn) => {
    clean = fn;
  };
  const job = () => {
    if (clean)
      clean();
    const newVal = effect2.run();
    cb(newVal, oldValue, onCleanUp);
    oldValue = newVal;
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (options.immediate) {
    job();
  }
  oldValue = effect2.run();
}
export {
  ReactiveEffect,
  activeEffect,
  computed,
  effect,
  isReactive,
  reactive,
  watch
};
//# sourceMappingURL=reactivity.js.map
