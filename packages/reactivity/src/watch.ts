import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

// 对象的深拷贝
function traverse(source, seen = new Set()) {
  if (!isObject(source)) {
    return source;
  }

  if (seen.has(source)) {
    return source;
  }

  seen.add(source);

  for (let k in source) {
    // 这里访问了对象的所有属性
    traverse(source[k], seen);
  }

  return source;
}

export function watch(source, cb, options: any = {}) {
  let getter;
  if (isReactive(source)) {
    // getter = () => source; // => 没有收集属性
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
    if (clean) clean();
    const newVal = effect.run();
    cb(newVal, oldValue, onCleanUp);
    oldValue = newVal;
  };

  const effect = new ReactiveEffect(getter, job);

  if (options.immediate) {
    job();
  }

  oldValue = effect.run();
}
