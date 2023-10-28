import { ShapeFlags } from "@vue/shared";

// 此方法并不关心 options 是谁提供的
export function createRenderer(options) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = options;

  // 挂载所有子节点，子节点不一定是元素，还有可能是组件
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // 递归调用 patch 方法 创建元素
      patch(null, child, container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, props, shapeFlag, children } = vnode;
    // 先创建父元素
    let el = (vnode.el = hostCreateElement(type));
    // 给父元素天机属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    // 区分子节点类型，挂载子节点
    if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      // 循环挂载
      mountChildren(children, el);
    } else {
      // 文本节点
      hostSetElementText(el, children);
    }
    //  将元素插入到父级中
    hostInsert(el, container);
  };
  const patchElement = (n1, n2, container) => {};

  // patch 方法每次更细你都会重新执行
  const patch = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化逻辑
      mountElement(n2, container);
    } else {
      patchElement(n1, n2, container);
    }
  };

  return {
    render(vnode, container) {
      // 根据我们的 vnode 和容器
      // 通过vnode 创建真实dom 插入到容器中
      // ====
      // render(null) 将元素卸载掉
      if (vnode == null) {
        // 执行卸载逻辑
      } else {
        // render({type: 'div'}) => render({type: 'span'})
        // render({type: "div", {style: {color: 'red}}} ) => render({type: "div", {style: {color: 'green}}} )
        const prevVnode = container._vnode || null;
        const nextVnode = vnode;

        patch(prevVnode, nextVnode, container);
        container._vnode = nextVnode; //第一次渲染的虚拟节点
      }
    },
  };
}
