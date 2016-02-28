var module = angular.module('OfficeHours.client');
module.controller('memberProfileCtrl', function ($scope, $rootScope,$http, serviceUrl,$state) {
  $scope.model = {};
  $scope.callback = {};
  $scope.model.user = $rootScope.user;

});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.member-profile', {
      //abstract: true,
      url: '/member-profile',
      controller: 'memberProfileCtrl',
      templateUrl: 'components/memberProfile/memberProfile.tpl.html',
      resolve:{
        user:function (userService) {
          return userService.checkLogin();
        }
      }
    });
});