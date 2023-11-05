import { ShapeFlags } from "@vue/shared";
import { isSameVNode } from "./createVNode";

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

  const unmount = (vnode) => {
    // 后面要卸载的元素可能不是元素
    hostRemove(vnode.el);
  };

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
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

  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }

    for (let key in oldProps) {
      // 新的里面没有
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const patchChildren = (n1, n2, el) => {
    // 比较前后2个节点的差异
    let c1 = n1.children;
    let c2 = n2.children;
    let prevShapeFlag = n1.shapeFlag; // 上一次的
    let currentShapeFlag = n2.shapeFlag; // 新的
    // 文本 数组 空  9种
    // 文本 - 数组  文本删除掉，换成数组
    // 文本 - 空    清空文本
    // 文本 - 文本  新的替换老的

    // 数组 - 文本 移除数组，换成文本
    //     - 空   移除数组，换成空
    //     - 数组 diff

    // 空  - 文本 添加文本
    //     - 数组 挂载数组
    //     - 空   无需处理

    // 新的文本
    if (currentShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧的数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }

      if (c1 !== c2) {
        // ? 说明文本有变化？？？？ -> 老的是文本或者空，直接采用新的
        hostSetElementText(el, c2);
      }
    } else {
      // 新的数组和 null 的情况
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (currentShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff 算法
        } else {
          //! 老的是数组，新的是空 (新的是文本 已经在上面处理过了)
          unmountChildren(c1);
        }
      } else {
        // 旧的是文本
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        // 本次是数组，则直接挂载即可
        if (currentShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (n1, n2, container) => {
    // 更新逻辑
    let el = (n2.el = n1.el);
    patchProps(n1.props, n2.props, el);
    patchChildren(n1, n2, el);
  };

  // patch 方法每次更细你都会重新执行
  const patch = (n1, n2, container) => {
    // 1. 判断 n1 和 n2 是不是相同的节点，如果不是相同节点直接删掉换新的
    // ! 为什么不把这段逻辑写到 patchElement 里呢？ 因为要把 n1 置为 null
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1);
      n1 = null; // 删除之前的，继续走初始化流程
    }
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
        unmount(container._vnode); // 删掉容器上对应的 dom 元素
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
