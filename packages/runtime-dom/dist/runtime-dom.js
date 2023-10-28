// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  insert(el, parent, anchor) {
    return parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    if (parent) {
      parent.removeChild(el);
    }
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    return node.nodeValue = text;
  },
  setElementText(node, text) {
    return node.textContent = text;
  },
  parentNode(node) {
    return node.parent;
  },
  nextSibling(node) {
    return node.nextSibling;
  }
};

// packages/runtime-dom/src/props.ts
function patchStyle(el, prevValue, nextValue) {
  const style = el["style"];
  if (nextValue) {
    for (let key in nextValue) {
      style[key] = nextValue(key);
    }
  }
  if (prevValue) {
    for (let key in prevValue) {
      if (nextValue[key] == null) {
        style[key] = null;
      }
    }
  }
}
function patchClass(el, nextValue) {
  if (nextValue == null) {
    el.removeAttribute("class");
  } else {
    el.className = nextValue;
  }
}
function createInvoker(val) {
  const invoker = (e) => invoker.val(e);
  invoker.val = val;
  return invoker;
}
function patchEvent(el, eventName, nextValue) {
  const invokers = el._vei || (el.vei = {});
  const exists = invokers[eventName];
  if (exists && nextValue) {
    exists.val = nextValue;
  } else {
    const name = eventName.slice(2).toLowerCase();
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue);
      el.addEventListener(name, invoker);
    } else if (exists) {
      el.removeEventListener(name, exists);
      invokers[eventName] = null;
    }
  }
}
function patchAttr(el, key, nextValue) {
  if (nextValue == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
}
function patchProp(el, key, prevValue, nextValue) {
  if (key === "style") {
    return patchStyle(el, prevValue, nextValue);
  } else if (key === "class") {
    return patchClass(el, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}

// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isString(value) {
  return typeof value === "string";
}

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = options;
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      patch(null, child, container);
    }
  };
  const mountElement = (vnode, container) => {
    const { type, props, shapeFlag, children } = vnode;
    let el = vnode.el = hostCreateElement(type);
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (16 /* ARRAY_CHILDREN */ & shapeFlag) {
      mountChildren(children, el);
    } else {
      hostSetElementText(el, children);
    }
    hostInsert(el, container);
  };
  const patchElement = (n1, n2, container) => {
  };
  const patch = (n1, n2, container) => {
    if (n1 == null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2, container);
    }
  };
  return {
    render(vnode, container) {
      if (vnode == null) {
      } else {
        const prevVnode = container._vnode || null;
        const nextVnode = vnode;
        patch(prevVnode, nextVnode, container);
        container._vnode = nextVnode;
      }
    }
  };
}

// packages/runtime-core/src/createVNode.ts
function isVNode(val) {
  return !!(val && val.__v_isVNode);
}
function createVNode(type, props, children = null) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
  const vnode = {
    __v_isVNode: true,
    shapeFlag,
    type,
    props,
    key: props && props.key,
    el: null,
    // 每个虚拟节点都对应一个真实节点，用来存放真实节点的后续更新的时候会产生新的虚拟节点，比较差异更新真实dom
    children
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 |= 16 /* ARRAY_CHILDREN */;
    } else {
      type2 |= 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag |= type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const len = arguments.length;
  if (len === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (len > 3) {
      children = Array.from(arguments).slice(2);
    } else {
      if (len === 3 && isVNode(children)) {
        children = [children];
      }
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/runtime-dom/src/index.ts
var renderOptions = { ...nodeOps, patchProp };
function render(vdom, container) {
  const { render: render2 } = createRenderer(renderOptions);
  render2(vdom, container);
}
export {
  createRenderer,
  h,
  render
};
//# sourceMappingURL=runtime-dom.js.map
