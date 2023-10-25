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
  __v_isRef = true;
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
  __v_isRef = true;
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

// 后续我们写模版编译的时候会用到这个方法，渲染的时候会用到
export function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldVal = target[key];
      if (oldVal.__v_isRef) {
        oldVal.value = value;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}
