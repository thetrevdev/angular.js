'use strict';

/**
 * @description
 *
 * This object extends the error class and provides interpolation capability
 * to make it easier to write and read Error messages within Angular. It can
 * be called as follows:
 *
 * throw new NgError(13, 'This {0} is {1}', foo, bar);
 *
 * The above will replace {0} with the value of foo, and {1} with the value of
 * bar. The object is not restricted in the number of arguments it can take.
 *
 * If fewer arguments are specified than necessary for interpolation, they are
 * left untouched.
 */
/**
 * @param {...} arguments The first argument to this object is the error
 *     number, the second argument the message with templated points for
 *     Interpolation (of the for {0} for the first, {1} for the second and
 *     so on). The second argument onwards are interpolated into the error
 *     message string in order.
 */
function NgError() {
  var message = arguments[1],
      i = 0,
      l = arguments.length - 2,
      reg;

  for (; i < l; i++) {
    reg = new RegExp("\\{" + i + "\\}", "gm");
    message = message.replace(reg, arguments[i + 2]);
  }
  this.message = message;
}

NgError.prototype = new Error();
