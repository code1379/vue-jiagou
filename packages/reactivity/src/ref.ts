import { trackEffects, triggerEffects } from "./baseHandler";
import { activeEffect } from "./effect";
import { toReactive } from "./reactive";

export function ref(value) {
  return new RefImpl(value);
}
// computed + watch
class RefImpl {
  // 内部采用类的属性访问器 -> Object.defineProperty
  public _value;
  dep = new Set();
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    if (activeEffect) {
      trackEffects(this.dep);
    }
    return this._value;
  }

  set value(newVal) {
    if (newVal !== this.rawValue) {
      this.rawValue = newVal;
      this._value = toReactive(newVal);
      triggerEffects(this.dep);
    }
  }
}

// ref 代理的是实现
class ObjectRefImpl {
  constructor(public object, public key) {}

  get value() {
    return this.object[this.key];
  }

  set value(newVal) {
    this.object[this.key] = newVal;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  let res = {};

  for (let key in object) {
    res[key] = toRef(object, key);
  }

  return res;
}
