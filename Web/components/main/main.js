var module = angular.module('OfficeHours.client');
module.controller('mainCtrl', function ($scope, $http, serviceUrl) {
  $scope.model = {};
  $scope.callback = {};


  $http({
    method: "POST",
    url: serviceUrl.path('${api}/user/doit'),
    data:{userId:'mike'},
    extractResponse: ''
  }).then(function (state) {
      $scope.model.item=state.data.userId;
  });
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