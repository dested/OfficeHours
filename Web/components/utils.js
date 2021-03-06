angular.module('OfficeHours.client')
  .factory('apiKey', function ($window) {
    var url = 'http://localhost:4545/api'; // local

    if (location.hostname != 'localhost') {
      url = 'https://api.officehours.club/api'; // server
    }
    return url;
  })
  .provider('requestInterceptor', function () {
    /*
     At the moment, the api does not Accept requests with the same payload as it sends out.
     If we change that we can use set useMeta in a config function and the request interceptor will do it for us
     */
    this.useMeta = false;

    var transform = function (data, meta) {
      if (this.useMeta) {
        var payload = {
          data: data
        };

        if (meta) {
          payload.meta = meta;
        }
        return payload;
      }
      return data;
    };

    this.$get = ['apiKey', '$q', function (apiKey, $q) {
      var apiRegEx = new RegExp('^' + apiKey);

      return {
        request: function (request) {
          if (apiRegEx.test(request.url)) {
            request.data = transform(request.data);
          }
          return request;
        },
        response: function (response) {
          if (apiRegEx.test(response.config.url)) {
            var data = response.data.data;

            if (data && response.config.extractResponse) {
              if (data[response.config.extractResponse] === null) return null;
              var extractedData = data[response.config.extractResponse] || {};
              extractedData.meta = response.data.meta;
              return extractedData;
            }

            return response.data;
          }
          return response;
        },
        responseError: function (response) {
          var hasErrors = false;
          if (apiRegEx.test(response.config.url) && response.status !== 0) { // A response status of 0 is a failed response or an aborted request.
            hasErrors = !!(response.data && response.data.meta && response.data.meta.errors);
            console.error('api error : ', hasErrors ? response.data.meta.errors : 'did not find error array', response.config, response);
            // TODO: check response.status === 500 and alert the user?
          }
          return $q.reject(hasErrors ? response.data.meta.errors : response);
        }
      };
    }];
  })

  .config(function ($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.authPrefix = '';
    jwtInterceptorProvider.tokenGetter = ['config', 'apiKey',  function (config, apiKey) {
      var hyApiRegEx = new RegExp('^' + apiKey);
      if (hyApiRegEx.test(config.url)) {
        return localStorage.getItem("jwt");
      }
    }];

    $httpProvider.interceptors.push('requestInterceptor');
    $httpProvider.interceptors.push('jwtInterceptor');
  })
  .run(function ($q, spinnerService) {
    var defer = $q.defer();
    var promisePrototype = Object.getPrototypeOf(defer.promise);
    promisePrototype.monitor = function (message) {
      if(!this.then)return this;
      spinnerService.monitorPromise(message, this);
      return this;
    };
  })
  .service('serviceUrl', function ($window, apiKey) {
    this.path = function (templateStr, obj) {
      obj = obj || {};
      obj.api = apiKey;
      return _.template(templateStr)(obj);
    };
  })

  .run(function ($rootScope, $state, spinnerService) {

    // Prevent users from viewing restricted pages unless they are logged in
    $rootScope.$on('$stateChangeStart', function (e, to) {

      if (to.data && to.data.requiresLogin) {
        var item = localStorage.getItem('jwt');
        if (!(item && item.length)) {
          e.preventDefault();
          if (to.resolve) {
            spinnerService.stopSpinner();
          }
          $state.go('inner.login');
        }
      }

    });


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState && toState.resolve) {
        spinnerService.startSpinner('Loading...');
      }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      if (toState && toState.resolve) {
        spinnerService.stop();
      }

      $rootScope.isIndex=toState.name=='main';

      // Scroll to the top of the page.
      $("html, body").animate({scrollTop: 0}, 200);
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      console.error('Failed to change to a state', error);

      if (toState && toState.resolve) {
        spinnerService.stopSpinner();
      }

      $state.go('main');


    });
  }).directive('myEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.myEnter);
          });

          event.preventDefault();
        }
      });
    };
  });


;

