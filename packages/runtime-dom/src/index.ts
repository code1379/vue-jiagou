import { nodeOps } from "./nodeOps";
import { patchProp } from "./props";
import { createRenderer } from "@vue/runtime-core";
const renderOptions = { ...nodeOps, patchProp };
// 默认的渲染那属性，可以构建渲染器，也可以让用户提供渲染属性来渲染

// // 此方法并不关心 options 是谁提供的 所以我们放到 runtime-core 里面
// export function createRenderer(options) {
//   return {
//     render(vdom, container) {
//       // 根据我们的 vdom 和容器
//       // 通过vdom 创建真实dom 插入到容器中
//     },
//   };
// }

export function render(vdom, container) {
  const { render } = createRenderer(renderOptions);
  render(vdom, container);
}

export * from "@vue/runtime-core";
