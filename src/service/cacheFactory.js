/**
 * @workInProgress
 * @ngdoc service
 * @name angular.service.$cacheFactory
 *
 * @description
 *
 *
 */
angularServiceInject("$cacheFactory", function() {
  var usedIds = {};

  return function(cacheId) {
    if (cacheId in usedIds) {
      throw Error('cacheId ' + cacheId + ' taken');
    }
    usedIds[cacheId] = '';

    var size = 0,
        data = {};

    return {
      id: function() { return cacheId },

      size: function() { return size; },

      put: function(key, value) {
        if (isUndefined(value)) return;
        if (!(key in data)) size++;
        data[key] = value;
      },

      get: function(key) {
        return data[key];
      },

      remove: function(key) {
        delete data[key];
        size--;
      }
    };
  }
});
