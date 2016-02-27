angular.module('OfficeHours.client')
  .service('userService',
  function ($rootScope, $http, serviceUrl, $q) {
    this.checkLogin = function () {
      var deferred = $q.defer();
      var promise = deferred.promise;


      var item = localStorage.getItem('jwt');
      if (item && item.length) {
        if ($rootScope.user) {
          deferred.resolve();
        }
        else {
          $http({
            method: "GET",
            url: serviceUrl.path('${api}/user/'),
            extractResponse: 'user'
          }).then(function (user) {
            debugger;
            $rootScope.user = user;
            deferred.resolve();
          });
        }
      }


      /*      build thing to hit the server to get user information
       build fucking sinch thing
       */


      return promise;
    };

    this.login = function (body) {
      localStorage.setItem('jwt', body.meta.jwt);
      $rootScope.user = body.data.user;
    };
  }
);
