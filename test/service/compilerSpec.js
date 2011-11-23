'use strict';

describe('$compile', function() {
  var element;
  beforeEach(inject(function(){
    element = null;
  }));

  afterEach(function(){
    dealoc(element);
  });


  describe('configuration', function() {
    it('should register a directive', inject(
      function($compileProvider, $provide) {
        var log = [];
        $provide.value('log', log);
        $compileProvider.directive('div', function() {
          return function(scope, element, attrName) {
            log.push('OK');
            element.text('SUCCESS');
          };
        })
      },
      function($compile, $rootScope, log) {
        element = $compile('<div></div>')($rootScope);
        expect(element.text()).toEqual('SUCCESS');
        expect(log).toEqual(['OK']);
      }
    ));
  });

  describe('directives', function() {
    var log;
    beforeEach(inject(function ($compileProvider) {
      log = '';
      $compileProvider.directive('a', function() {
        return { priority:3, templateFn: valueFn(function(scope, element) {
          element.text('A');
        })};
      });
      $compileProvider.directive('b', function() {
        return { priority:2, templateFn: valueFn(function(scope, element) {
          element.text( element.text() + 'B');
        })};
      });
      $compileProvider.directive('c', function() {
        return { priority:1, templateFn: valueFn(function(scope, element) {
          element.text( element.text() + 'C');
        })};
      });
      $compileProvider.directive('greet', function() {
        return { priority:10, templateFn: valueFn(function(scope, element, attrs) {
          element.text("Hello " + attrs.greet);
        })};
      });
      $compileProvider.directive('log', function() {
        return { priority:10, templateFn: valueFn(function(scope, element, attrs) {
          log += attrs.log;
        })};
      });
    }));


    it('should allow multiple directives per element', inject(function($compile, $rootScope){
      element = $compile('<a b="" x-c=""></a>')($rootScope);
      expect(element.text()).toEqual('ABC');
    }));


    it('should recurse to children', inject(function($compile, $rootScope){
      element = $compile('<div>0<a>1</a>2<b>3</b>4</div>')($rootScope);
      expect(element.text()).toEqual('0A23B4');
    }));


    it('should allow directives in classes', inject(function($compile, $rootScope) {
      element = $compile(
        '<div class="greet: angular; b:123; c"></div>')($rootScope);
      expect(element.html()).toEqual('Hello angularBC');
    }));


    it('should allow directives in comments', inject(function($compile, $rootScope) {
      element = $compile(
        '<div>0<!-- directive: log angular -->1</div>')($rootScope);
      expect(log).toEqual('angular');
    }));


    it('should send scope, element, and attributes', inject(
      function($compileProvider, $injector) {
        var injector = $injector;
        $compileProvider.directive('log', function($injector, $rootScope){
          expect($injector).toBe(injector); // verify that it is injectable
          return {
            templateFn: function(element, templateAttr) {
              expect(typeof templateAttr.$normalize).toBe('function');
              expect(typeof templateAttr.$set).toBe('function');
              expect(isElement(templateAttr.$element)).toBeTruthy();
              expect(element.text()).toEqual('unlinked');
              expect(templateAttr.exp).toEqual('abc');
              expect(templateAttr.aa).toEqual('A');
              expect(templateAttr.bb).toEqual('B');
              expect(templateAttr.cc).toEqual('C');
              return function(scope, element, attr) {
                expect(element.text()).toEqual('unlinked');
                expect(attr).toBe(templateAttr);
                expect(scope).toEqual($rootScope);
                element.text('worked');
              }
            }
          };
        });
      },
      function($rootScope, $compile) {
        element = $compile('<div class="log" exp="abc" aa="A" x-Bb="B" daTa-cC="C">unlinked</div>')($rootScope);
        expect(element.text()).toEqual('worked');
      }
    ));


    it('should process bindings', inject(function($rootScope, $compile){
      $rootScope.name = 'angular';
      element = $compile('<div name="attr: {{name}}">text: {{name}}</div>')($rootScope);
      $rootScope.$digest();
      expect(element.text()).toEqual('text: angular');
      expect(element.attr('name')).toEqual('attr: angular');
    }));


    it('should honor priority', inject(
      function($compileProvider) {
        forEach({low:0, med:1, high:2}, function(priority, priorityName) {
          $compileProvider.directive(priorityName, valueFn({
            templateFn: function() {
              return function(scope, element) {
                element.text(element.text() + priorityName + ';');
              }
            },
            priority: priority
          }));
        });
      },
      function($rootScope, $compile) {
        element = $compile('<span low high med></span>')($rootScope);
        expect(element.text()).toEqual('high;med;low;');
      }
    ));


    it('should handle exceptions', inject(
      function($compileProvider, $exceptionHandlerProvider) {
        $exceptionHandlerProvider.mode('log');
        $compileProvider.directive('factoryError', function() { throw 'FactoryError'; });
        $compileProvider.directive('templateError',
          valueFn({ templateFn: function() { throw 'TemplateError'; } }));
        $compileProvider.directive('linkingError',
          valueFn(function() { throw 'LinkingError'; }));
      },
      function($rootScope, $compile, $exceptionHandler) {
        element = $compile('<div factory-error template-error linking-error></div>')($rootScope);
        expect($exceptionHandler.errors).toEqual([
          'FactoryError', 'TemplateError', 'LinkingError']);
      }
    ));


    it('should prevent further directives from running', inject(
      function($compileProvider) {
        $compileProvider.directive('stop', valueFn({
          priority: -100, // even with negative priority we still should be able to stop descend
          terminal: true
        }));
      },
      function($rootScope, $compile) {
        element = $compile('<div stop><a>OK</a></div>')($rootScope);
        expect(element.text()).toEqual('OK');
      }
    ));


    it('should prevent further directives from running, but finish current level', inject(
      function($compileProvider, $provide) {
        var log = [];
        $provide.value('log', log);
        $compileProvider.directive('stop', valueFn({
          priority: 10,
          terminal: true,
          templateFn: function() {
            log.push('stop');
          }
        }));
        $compileProvider.directive('same', valueFn({
          priority: 10,
          templateFn: function() {
            log.push('same');
          }
        }));
        $compileProvider.directive('low', valueFn({
          templateFn: function() {
            log.push('low');
          }
        }));
      },
      function($rootScope, $compile, log) {
        element = $compile('<div low stop same><a>OK</a></div>')($rootScope);
        expect(element.text()).toEqual('OK');
        log.sort();
        expect(log).toEqual(['same', 'stop']);
      }
    ));


    it('should allow setting of attributes', inject(
      function($compileProvider) {
        $compileProvider.directive({
          setter: valueFn(function(scope, element, attr) {
            attr.$set('name', 'abc');
            attr.$set('disabled', true);
            expect(attr.name).toBe('abc');
            expect(attr.disabled).toBe(true);
          })
        });
      },
      function($rootScope, $compile) {
        element = $compile('<div setter></div>')($rootScope);
        expect(element.attr('name')).toEqual('abc');
        expect(element.attr('disabled')).toEqual('disabled');
      }
    ));

    it('should read boolean attributes as boolean', inject(
      function($compileProvider) {
        $compileProvider.directive({
          div: valueFn(function(scope, element, attr) {
            element.text(attr.required);
          })
        });
      },
      function($rootScope, $compile) {
        element = $compile('<div required></div>')($rootScope);
        expect(element.text()).toEqual('true');
      }
    ));
  });

  it('should create new instance of attr for each template stamping', inject(
    function($compileProvider, $provide) {
      var state = { first: [], second: [] };
      $provide.value('state', state);
      $compileProvider.directive({
        first: valueFn({
          priority: 1,
          templateFn: function(templateElement, templateAttr) {
            return function(scope, element, attr) {
              state.first.push({
                template: {element: templateElement, attr:templateAttr},
                link: {element: element, attr: attr}
              });
            }
          }
        }),
        second: valueFn({
          priority: 2,
          templateFn: function(templateElement, templateAttr) {
            return function(scope, element, attr) {
              state.second.push({
                template: {element: templateElement, attr:templateAttr},
                link: {element: element, attr: attr}
              });
            }
          }
        })
      });
    },
    function($rootScope, $compile, state) {
      var template = $compile('<div first second>');
      dealoc(template($rootScope.$new(), noop));
      dealoc(template($rootScope.$new(), noop));

      // instance between directives should be shared
      expect(state.first[0].template.element).toBe(state.second[0].template.element);
      expect(state.first[0].template.attr).toBe(state.second[0].template.attr);

      // the template and the link can not be the same instance
      expect(state.first[0].template.element).not.toBe(state.first[0].link.element);
      expect(state.first[0].template.attr).not.toBe(state.first[0].link.attr);

      // each new template needs to be new instance
      expect(state.first[0].link.element).not.toBe(state.first[1].link.element);
      expect(state.first[0].link.attr).not.toBe(state.first[1].link.attr);
      expect(state.second[0].link.element).not.toBe(state.second[1].link.element);
      expect(state.second[0].link.attr).not.toBe(state.second[1].link.attr);
    }
  ));


  describe('linking', function() {
    var log;

    beforeEach(inject(function($compileProvider) {
      log = '';

      forEach(['a', 'b', 'c'], function(name) {
        $compileProvider.directive(name, valueFn({
          templateFn: function() {
            log += 't' + uppercase(name) + ';';
            return {
              pre: function() {
                log += 'pre' + uppercase(name) + ';';
              },
              post: function linkFn() {
                log += 'post' + uppercase(name) + ';';
              }
            };
          }
        }));
      });
    }));

    it('should not store linkingFns for noop branches', inject(function ($rootScope, $compile) {
      var element = jqLite('<div name="{{a}}"><span>ignore</span></div>');
      var template = $compile(element);
      // Now prune the branches with no directives
      element.find('span').remove();
      expect(element.find('span').length).toBe(0);
      // and we should still be able to compile without errors
      template($rootScope);
    }));

    it('should compile from top to bottom but link from bottom up', inject(function($compile, $rootScope) {
      $compile('<a b><c></c></a>')($rootScope);
      expect(log).toEqual('tA;tB;tC;preA;preB;preC;postC;postA;postB;');
    }));
  });

  describe('scope', function() {
    var log;

    beforeEach(inject(function($compileProvider) {
      log = '';

      forEach(['a', 'b'], function(name) {
        $compileProvider.directive('scope' + uppercase(name), valueFn({
          scope: true,
          templateFn: function() {
            return function (scope, element) {
              log += scope.$id + ';';
              expect(element.data('$scope')).toBe(scope);
            };
          }
        }));
      });
      $compileProvider.directive('log', valueFn(function(scope){
        log += 'log-' + scope.$id + ';';
      }))
    }))


    it('should allow creation of new scopes', inject(function($rootScope, $compile) {
      element = $compile('<div><span scope-a><a log></a></span></div>')($rootScope);
      expect(log).toEqual('log-002;002;');
    }));

    it('should not allow more then one scope creation per element', inject(
        function($rootScope, $compile) {
      expect(function(){
        $compile('<div class="scope-a; scope-b"></div>');
      }).toThrow('Multiple directives [scopeA, scopeB] asking for new scope on: ' +
        '<' + (msie < 9 ? 'DIV' : 'div') + ' class="scope-a; scope-b">');
    }));

    it('should treat new scope on new template as noop', inject(function($rootScope, $compile) {
      $compile('<div scope-a></div>')($rootScope);
      expect(log).toEqual('001;');
    }));
  });

  describe('bindings', function() {
    it('should decorate the binding with ng-binding and interpolation function', inject(
        function($compile, $rootScope) {
      element = $compile('<div>{{1+2}}</div>')($rootScope);
      expect(element.hasClass('ng-binding')).toBe(true);
      expect(element.data('$ngBinding')[0].exp).toEqual('{{1+2}}');
    }));
  });

});
