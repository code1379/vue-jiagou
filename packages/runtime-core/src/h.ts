import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./createVNode";

export function h(type, propsOrChildren?, children?) {
  // createElement 用户使用的创建虚拟 dom 方法，上层封装的方法

  const len = arguments.length;

  if (len === 2) {
    // createVNode 要求孩子不是文本就是一个数组
    // createVNode();
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        // h("div", h("span"));
        return createVNode(type, null, [propsOrChildren]);
      }
      // h("div", { color: "red" });
      return createVNode(type, propsOrChildren);
    } else {
      //  h("div", 'hello');
      // h("div", [h("span"), h("span")]);
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      // h("div", {}, h("span"), h("span"));
      children = Array.from(arguments).slice(2);
    } else {
      if (len === 3 && isVNode(children)) {
        // const vnode6h("div", {}, h("span"),);
        children = [children];
      }
    }
    // h("div", {}, '123');
    // h("div", {},  [h("span"), h("span")]);
    // h("div");
    return createVNode(type, propsOrChildren, children);
  }
}

// const vnode1 = h("div");

// const vnode7 = h("div", 'hello');

// const vnode2 = h("div", h("span"));

// const vnode3 = h("div", { color: "red" });

// const vnode4 = h("div", [h("span"), h("span")]);

// const vnode5 = h("div", {}, [h("span"), h("span")]);

// const vnode6 = h("div", {}, h("span"), h("span"));
// const vnode8 = h("div", {}, '123');
