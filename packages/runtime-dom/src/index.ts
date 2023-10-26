import { nodeOps } from "./nodeOps";
import { patchProp } from "./props";

const renderOptions = { ...nodeOps, patchProp };
// 默认的渲染那属性，可以构建渲染器，也可以让用户提供渲染属性来渲染
console.log("renderOptions", renderOptions);
