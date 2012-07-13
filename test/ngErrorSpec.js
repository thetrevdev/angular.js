'use strict';

describe('NgError', function() {

  it('should be of type Error', function() {
    var myError = new NgError();
    expect(myError instanceof Error).toBeTruthy();
  });


  it('should interpolate string arguments without quotes', function() {
    var myError = new NgError(26, 'This {0} is "{1}"', 'foo', 'bar');
    expect(myError.message).toBe('This foo is "bar"');
  });


  it('should interpolate non-string arguments', function() {
    var arr = [1, 2, 3],
        obj = {a: 123, b: 'baar'},
        anonFn = function(something) { return something; },
        namedFn = function foo(something) { return something; },
        myError;

    myError = new NgError(26, 'arr: {0}; obj: {1}; anonFn: {2}; namedFn: {3}',
                               arr,      obj,      anonFn,      namedFn);

    expect(myError.message).
        toBe('arr: [1,2,3]; obj: {"a":123,"b":"baar"}; ' +
             'anonFn: function (something) { return something; }; ' +
             'namedFn: foo()');
  });


  it('should not suppress falsy objects', function() {
    var myError = new NgError(26, 'false: {0}; zero: {1}; null: {2}; undefined: {3}; emptyStr: {4}',
                                   false,      0,         null,      undefined,      '');
    expect(myError.message).
        toBe('false: false; zero: 0; null: null; undefined: undefined; emptyStr: ');
  });


  it('should preserve interpolation markers when fewer arguments than needed are provided',
      function() {
    // this way we can easily see if we are passing fewer args than needed

    var foo = 'Fooooo',
        myError = new NgError(26, 'This {0} is {1} on {2}', foo);

    expect(myError.message).toBe('This Fooooo is {1} on {2}');
  });


  it('should pass through the message if no interpolation is needed', function() {
    var myError = new NgError(23, 'Something horrible happened!');
    expect(myError.message).toBe('Something horrible happened!');
  })
});
