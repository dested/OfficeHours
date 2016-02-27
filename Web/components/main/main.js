var module = angular.module('OfficeHours.client');
module.controller('mainCtrl', function ($scope, $http, serviceUrl) {
  $scope.model = {};
  $scope.callback = {};
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('main', {
      //abstract: true,
      url: '/',
      controller: 'mainCtrl',
      templateUrl: 'components/main/main.tpl.html'
    });
});