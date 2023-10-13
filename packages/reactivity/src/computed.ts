import { isFunction } from "@vue/shared";
import { ReactiveEffect, activeEffect } from "./effect";
import { trackEffects, triggerEffects } from "./baseHandler";
class ComputedRefImpl {
  effect;
  _value;
  _dirty = true;
  dep = new Set();
  constructor(public getter, public setter) {
    // 计算属性就是一个 effect 会让 getter 中的属性收集这个 effect
    this.effect = new ReactiveEffect(getter, () => {
      // * 当 firstname 和 lastname 改变会触发 schedular， 触发 dep
      if (!this._dirty) {
        this._dirty = true; // 让计算属性标记为脏值
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
      // 取值，让 getter 执行拿到返回值，作为计算属性的值
      this._value = this.effect.run();
    }

    return this._value;
  }
  set value(val) {
    // 修改触发setter即可
    this.setter(val);
  }
}
export function computed(getterOrOptions) {
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
