var module = angular.module('OfficeHours.client');
module.controller('mainCtrl', function ($scope, $http, serviceUrl) {
  $scope.model = {};
  $scope.callback = {};


/*
  $http({
    method: "GET",
    url: serviceUrl.path('${api}something/other'),
    extractResponse: 'stateData'
  }).then(function (state) {

  });
*/
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