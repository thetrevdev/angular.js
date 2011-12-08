'use strict';

/**
 * @ngdoc function
 * @name angular.module.ng.$interpolateProvider
 * @function
 *
 * @description
 *
 * Used for configuring the interpolation markup. Initially set to `{{` and `}}`.
 */

/**
 * @ngdoc property
 * @name angular.module.ng.$interpolateProvider#startSymbol
 * @propertyOf angular.module.ng.$interpolateProvider
 *
 * @description
 * Symbol to denote start of expression in the interpolated string. Initially `{{`.
 */

/**
 * @ngdoc property
 * @name angular.module.ng.$interpolateProvider#endSymbol
 * @propertyOf angular.module.ng.$interpolateProvider
 *
 * @description
* Symbol to denote the end of expression in the interpolated string. Initially `}}`.
 */


/**
 * @ngdoc function
 * @name angular.module.ng.$interpolate
 * @function
 *
 * @requires $parse
 *
 * @description
 *
 * Compiles a string with markup into an interpolation function. This service is used by the
 * HTTML {@link angular.module.ng.$compile $compile} service for data binding. See
 * {@link angular.module.ng.$interpolateProvider $interpolateProvider} for configuring the
 * interpolation markup.
 *
 *
   <pre>
    angular.injector('ng').invoke(null, function($interpolate) {
      var exp = $interpolate('Hello {{name}}!');
      expect(exp({name:'Angular'}).toEqual('Hello Angular!');
    });
   </pre>
 *
 *
 * @param {string} text The text with markup to interpolate.
 * @returns {function(context)} an interpolation function which is used to compute the interpolated
 *    string. The function has these parameters:
 *
 *    * `context`: an object against which any expressions embedded in the strings are evaluated
 *      against.
 *
 */
function $InterpolateProvider() {
  this.startSymbol = '{{';
  this.endSymbol = '}}';

  this.$get = ['$parse', function($parse) {
    var startSymbol = this.startSymbol,
        startSymbolLength = startSymbol.length,
        endSymbol = this.endSymbol,
        endSymbolLength = endSymbol.length;

    return function(text, templateOnly) {
      var startIndex,
          endIndex,
          index = 0,
          parts = [],
          length = text.length,
          hasInterpolation = false,
          fn,
          exp,
          concat = [];

      while(index < length) {
        if ( ((startIndex = text.indexOf(startSymbol, index)) != -1) &&
             ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) ) {
          (index != startIndex) && parts.push(text.substring(index, startIndex));
          parts.push(fn = $parse(exp = text.substring(startIndex + startSymbolLength, endIndex)));
          fn.exp = exp;
          index = endIndex + endSymbolLength;
          hasInterpolation = true;
        } else {
          // we did not find anything, so we have to add the remainder to the parts array
          (index != length) && parts.push(text.substring(index));
          index = length;
        }
      }

      if (!(length = parts.length)) {
        // we added, nothing, must have been an empty string.
        parts.push('');
        length = 1;
      }

      if (!templateOnly  || hasInterpolation) {
        concat.length = length;
        fn = function(context) {
          for(var i = 0, ii = length, part; i<ii; i++) {
            if (typeof (part = parts[i]) == 'function') {
              part = part(context);
              if (part == null || part == undefined) {
                part = '';
              } else if (typeof part != 'string') {
                part = toJson(part);
              }
            }
            concat[i] = part;
          }
          return concat.join('');
        };
        fn.exp = text;
        fn.parts = parts;
        return fn;
      }
    };
  }];
}

