'use strict';

describe('NgError', function() {
  it("should be of type Error", function() {
    var myError = new NgError();
    expect(myError instanceof Error).toBeTruthy();
  });

  it("should interpolate arguments", function() {
    var myError = new NgError(26, 'This {0} is {1}', 'foo', 'bar');
    expect(myError.message).toEqual('This foo is bar');
  });

  it("should interpolate non string arguments", function() {
    var foo = [1, 2, 3];
    var bar = {a: 123, b: 'baar'};
    var myError = new NgError(26, 'This {0} is {1}', foo, bar);
    expect(myError.message).toEqual('This 1,2,3 is [object Object]');
  });

  it("should suppress not suppress falsy objects", function() {
    var foo = false;
    var bar = 0;
    var myError = new NgError(26, 'This {0} is {1}', foo, bar);
    expect(myError.message).toEqual('This false is 0');
  });

  it("should handle less arguments than necessary", function() {
    var foo = 'Fooooo';
    var myError = new NgError(26, 'This {0} is {1} on {2}', foo);
    expect(myError.message).toEqual('This Fooooo is {1} on {2}');    
  });
});
