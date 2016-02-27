var module = angular.module('OfficeHours.client');
module.controller('loginCtrl', function ($scope, $rootScope,$http, serviceUrl) {
  $scope.model = {};
  $scope.callback = {};

  $scope.callback.login=function(){
    $http({
      method: "POST",
      url: serviceUrl.path('${api}/user/login'),
      data:{
        email:$scope.model.email,
        password:$scope.model.password
      }
    }).then(function (body) {
      debugger;
      localStorage.setItem('jwt', body.meta.jwt);
      $rootScope.user=body.data;
    });
  };
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      //abstract: true,
      url: '/login',
      controller: 'loginCtrl',
      templateUrl: 'components/login/login.tpl.html'
    });
});