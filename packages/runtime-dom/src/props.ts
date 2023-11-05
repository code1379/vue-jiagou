function patchStyle(el, prevValue, nextValue) {
  // { color: "red" } -> {background: "red"}
  const style = el["style"];
  if (nextValue) {
    for (let key in nextValue) {
      style[key] = nextValue[key];
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
  // class: "abc" ==> class="abc cdg"
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
  // 对于事件而言，我们并不关心之前那是什么，而是用最新的结果
  const invokers = el._vei || (el.vei = {});
  const exists = invokers[eventName];
  // click:a click:b
  // 通过一个自定义的变量，绑定这个变量，后续更改变量对应的值
  // click: customEvent  -> f
  if (exists && nextValue) {
    // 换绑事件
    exists.val = nextValue;
  } else {
    const name = eventName.slice(2).toLowerCase();
    if (nextValue) {
      const invoker = (invokers[eventName] = createInvoker(nextValue));
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

export function patchProp(el, key, prevValue, nextValue) {
  // 属性的初始化和更行：对于初始化 prevValue: null

  if (key === "style") {
    // { style: {color: red}} -> el.style[key] = value
    return patchStyle(el, prevValue, nextValue);
  } else if (key === "class") {
    // {class: "abc"} -> el.className(class, '')
    return patchClass(el, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    // onClick -> addEventListener
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}
