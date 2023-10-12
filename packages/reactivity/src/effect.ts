export let activeEffect = undefined;

class ReactiveEffect {
  public parent = undefined;

  deps = []; // ! effect 重要记录那些属性在 effect 中调用
  constructor(public fn) {}

  run() {
    // 当运行的时候，我们需要将属性和对应的effect 关联起来
    // 利用js是单线程的特性，先放在全局，再取值
    try {
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn(); // 触发属性的 get
    } finally {
      activeEffect = this.parent;
    }
  }
}

// 属性和effect之间是什么关系
// 1:1
// 1:n
// n:n

export function effect(fn) {
  // 将用户传递的函数，拿到变成一个响应式函数
  const _effect = new ReactiveEffect(fn);
  // 默认让用户的函数执行一次
  _effect.run();
}
