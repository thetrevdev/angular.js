describe('$cacheFactory', function() {
  var scope, $cacheFactory;

  beforeEach(function() {
    scope = angular.scope();
    $cacheFactory = scope.$service('$cacheFactory');
  });


  it('should be injected', function() {
    expect($cacheFactory).toBeDefined();
  });


  it('should return a new cache whenever called', function() {
    var cache1 = $cacheFactory('cache1');
    var cache2 = $cacheFactory('cache2');
    expect(cache1).not.toEqual(cache2);
  });


  it('should complain if the cache id is being reused', function() {
    $cacheFactory('cache1');
    expect(function() {$cacheFactory('cache1')}).
      toThrow("cacheId cache1 taken");
  });


  describe('cache', function() {
    var cache;

    beforeEach(function() {
      cache = $cacheFactory('test');
    });


    describe('put, get & remove', function() {

      it('should add cache entries via add and retrieve them via get', function() {
        cache.put('key1', 'bar');
        cache.put('key2', {bar:'baz'});

        expect(cache.get('key2')).toEqual({bar:'baz'});
        expect(cache.get('key1')).toBe('bar');
      });


      it('should ignore put if the value is undefined', function() {
        cache.put();
        cache.put('key1');
        cache.put('key2', undefined);

        expect(cache.size()).toBe(0);
      });


      it('should remove entries via remove', function() {
        cache.put('k1', 'foo');
        cache.put('k2', 'bar');

        cache.remove('k2');

        expect(cache.get('k1')).toBe('foo');
        expect(cache.get('k2')).toBeUndefined();

        cache.remove('k1');

        expect(cache.get('k1')).toBeUndefined();
        expect(cache.get('k2')).toBeUndefined();
      });


      it('should stringify keys', function() {
        cache.put('123', 'foo');
        cache.put(123, 'bar');

        expect(cache.get('123')).toBe('bar');
        expect(cache.size()).toBe(1);

        cache.remove(123);
        expect(cache.size()).toBe(0);
      })
    });


    describe('size', function() {

      it('should increment with put and decrement with remove', function() {
        expect(cache.size()).toBe(0);

        cache.put('foo', 'bar');
        expect(cache.size()).toBe(1);

        cache.put('baz', 'boo');
        expect(cache.size()).toBe(2);

        cache.remove('baz');
        expect(cache.size()).toBe(1);

        cache.remove('foo');
        expect(cache.size()).toBe(0);
      });
    });


    describe('id', function() {

      it('should return cache id', function() {
        expect(cache.id()).toBe('test');
      })
    });
  });
});
