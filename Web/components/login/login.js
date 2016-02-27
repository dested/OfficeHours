var module = angular.module('OfficeHours.client');
module.controller('loginCtrl', function ($scope, $rootScope,$http, serviceUrl,$state) {
  $scope.model = {};
  $scope.callback = {};

  var item = localStorage.getItem('jwt');
  if(item && item.length && false){
    if($rootScope.user.isVendor){
      $state.go('vendor-profile')
    }else{
      $state.go('member-profile')
    }
  }

  $scope.callback.login=function(){
    $http({
      method: "POST",
      url: serviceUrl.path('${api}/user/login'),
      data:{
        email:$scope.model.email,
        password:$scope.model.password
      }
    }).then(function (body) {
      localStorage.setItem('jwt', body.meta.jwt);
      $rootScope.user=body.data;
      if($rootScope.user.isVendor){
        $state.go('vendor-profile')
      }else{
        $state.go('member-profile')
      }
    }).monitor();
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