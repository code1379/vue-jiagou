export function isObject(value: any) {
  return typeof value === "object" && value !== null;
}

export function isFunction(value) {
  return typeof value === "function";
}
