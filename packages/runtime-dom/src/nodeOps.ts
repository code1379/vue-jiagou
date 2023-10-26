export const nodeOps = {
  insert(el, parent, anchor) {
    // <div id="app">   <span></span></div>
    // 具备插入到某个元素前面，如果不传递anchor，则是直接appendChild
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
    return (node.nodeValue = text);
  },
  setElementText(node, text) {
    return (node.textContent = text);
  },
  parentNode(node) {
    return node.parent;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
};
