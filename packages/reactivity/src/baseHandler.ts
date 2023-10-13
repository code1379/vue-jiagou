import { activeEffect } from "./effect";

export const enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
}
// 响应式对象的核心逻辑
export const mutableHandler = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 取值的时候关联 effect
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 设置值的时候出发 effect
    let oldVal = target[key];
    let flag = Reflect.set(target, key, value, receiver);

    if (value !== oldVal) {
      trigger(target, key, value, oldVal);
    }
    return flag;
  },
};
// Map = { ({name:"dell", age: 18}): name}
// Map = { name: set()}
// {name:"dell", age: 18} -> name  => [effect, effect]
const targetMap = new WeakMap();

function track(target, key) {
  if (activeEffect) {
    // 当前这个属性是在effect中使用才收集
    let depsMap = targetMap.get(target);

    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(key);

    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }

    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);

      activeEffect.deps.push(dep); // 这里让 effect 也记录一下 deps = [ name => set1, age => set2 ]
    }
  }
}

function trigger(target, key, value, oldValue) {
  // 找到 effect 执行
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effects = depsMap.get(key);

  if (effects) {
    [...effects].forEach((effect) => {
      // 当前正在执行的和现在是同一个，就屏蔽掉
      if (effect !== activeEffect) {
        effect.run();
      }
    });
  }
}
