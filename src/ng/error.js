'use strict';

/**
 * @description
 * 
 * This object extends the error class and provides interpolation capability
 * to make it easier to write and read Error Messages within Angular. It can
 * be called as follows:
 * 
 * throw new NgError(13, 'This {0} is {1}', foo, bar);
 * 
 * The above will replace {0} with the value of foo, and {1} with the value of
 * bar. The object is not restricted in the number of arguments it can take.
 * 
 * If less arguments are specified than necessary for interpolation, they are
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
  var s = arguments[1];
  for (var i = 0; i < arguments.length - 2; i++) {       
    var reg = new RegExp("\\{" + i + "\\}", "gm");             
    s = s.replace(reg, arguments[i + 2]);
  }
  this.message = s;
}
NgError.prototype = new Error();
