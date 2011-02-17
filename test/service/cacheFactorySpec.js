describe('$cacheFactory', function() {
  var scope, $cacheFactory;

  beforeEach(function() {
    scope = angular.scope();
    $cacheFactory = scope.$service('$cacheFactory');
  });


  it('should be injected', function() {
    expect($cacheFactory).toBeDefined();
  });
});