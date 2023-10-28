import { ShapeFlags, isString } from "@vue/shared";

export function isVNode(val) {
  return !!(val && val.__v_isVNode);
}

export function createVNode(type, props, children = null) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;

  const vnode = {
    __v_isVNode: true,
    shapeFlag,
    type,
    props,
    key: props && props.key,
    el: null, // 每个虚拟节点都对应一个真实节点，用来存放真实节点的后续更新的时候会产生新的虚拟节点，比较差异更新真实dom
    children,
  };

  if (children) {
    let type = 0;
    if (Array.isArray(children)) {
      // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
      type |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      // vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
      type |= ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }

  return vnode;
}

// 创建元素的时候 createElement() children.forEach(child => createELement(child))
