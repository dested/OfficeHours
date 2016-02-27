var module = angular.module('OfficeHours.client');
module.controller('registerCtrl', function ($scope, $rootScope,$http, serviceUrl,$state,userService) {
  $scope.model = {};
  $scope.callback = {};

  userService.checkLogin().then(function(){
    if ($rootScope.user) {
      if ($rootScope.user.isVendor) {
        $state.go('vendor-profile')
      } else {
        $state.go('member-profile')
      }
    }
  });


  $scope.callback.register=function(){
    $http({
      method: "POST",
      url: serviceUrl.path('${api}/user/register'),
      data:{
        email:$scope.model.email,
        password:$scope.model.password,
        isVendor:$scope.model.isVendor
      }
    }).then(function (body) {
      userService.login(body);
      if($rootScope.user.isVendor){
        $state.go('vendor-profile')
      }else{
        $state.go('member-profile')
      }
    });
  };
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('register', {
      //abstract: true,
      url: '/register',
      controller: 'registerCtrl',
      templateUrl: 'components/register/register.tpl.html'
    });
});