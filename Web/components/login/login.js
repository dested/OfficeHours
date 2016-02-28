var module = angular.module('OfficeHours.client');
module.controller('loginCtrl', function ($scope, $rootScope,userService, $http, serviceUrl, $state) {
  $scope.model = {};
  $scope.callback = {};

  userService.checkLogin().then(function(){
    if ($rootScope.user) {
      if ($rootScope.user.vendor) {
        $state.go('inner.vendor-profile')
      } else {
        $state.go('inner.member-profile')
      }
    }
  });


  $scope.callback.login = function () {
    $http({
      method: "POST",
      url: serviceUrl.path('${api}/user/login'),
      data: {
        email: $scope.model.email,
        password: $scope.model.password
      }
    }).then(function (body) {
      userService.login(body);
      if ($rootScope.user.vendor) {
        $state.go('inner.vendor-profile')
      } else {
        $state.go('inner.member-profile')
      }
    }).monitor();
  };
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.login', {
      //abstract: true,
      url: '/login',
      controller: 'loginCtrl',
      templateUrl: 'components/login/login.tpl.html'
    });
});