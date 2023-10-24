import { isObject } from "@vue/shared";
import { ReactiveFlags, mutableHandler } from "./baseHandler";

export function reactive(target) {
  return createReactiveObject(target);
}

const reactiveMap = new WeakMap(); // 防止内存泄露

function createReactiveObject(target) {
  if (!isObject(target)) {
    return;
  }
  // 2. 防止传递进来的是代理后的对象
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // 1. 防止同一个对象被代理两次，返回的永远是同一个代理对象
  let existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandler);
  reactiveMap.set(target, proxy);
  // 代理前 代理后做一个映射表
  // 如果用同一个对象做代理，直接返回上一次的代理结果
  return proxy;
}

export function isReactive(source) {
  return !!(source && source[ReactiveFlags.IS_REACTIVE]);
}

export function toReactive(source) {
  return isObject(source) ? reactive(source) : source;
}
