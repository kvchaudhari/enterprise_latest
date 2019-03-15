/**
 * Safely gets the name of a method
 * @param {function} method the method to be checked
 * @returns {string} the name of the method
 */
function methodName(method) {
  if (typeof method !== 'function') {
    throw new Error(`${typeof method} was provided where a function was expected.`);
  }
  if (typeof method.name === 'function') {
    return method.name;
  }

  // Regex for ES5 (IE11)
  // See https://stackoverflow.com/a/17923727/4024149
  const result = /^function\s+([\w$]+)\s*\(/.exec(method.toString());
  return result ? result[1] : '(anonymous function)';
}

/**
 * Deprecates a method in the codebase
 * @param {function} newMethod the new method to call
 * @param {function} oldMethod the name of the old method
 * @param {...object} [args] arguments that will be passed to the new function
 * @returns {function} wrapper method
 */
function deprecateMethod(newMethod, oldMethod) {
  const newMethodName = methodName(newMethod);
  const oldMethodName = methodName(oldMethod);

  const wrapper = function deprecatedMethodWrapper(...args) {
    if (typeof console === 'object') {
      console.warn(`"${oldMethodName}()" is deprecated. Please use "${newMethodName}()" instead.`);
    }
    newMethod.apply(this, args);
  };
  wrapper.prototype = newMethod.prototype;

  return wrapper;
}

export { deprecateMethod };
