var module = angular.module('OfficeHours.client');
module.controller('vendorProfileCtrl', function ($scope, $rootScope,$http, serviceUrl,$state) {
  $scope.model = {};
  $scope.callback = {};

});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.vendor-profile', {
      //abstract: true,
      url: '/vendor-profile',
      controller: 'vendorProfileCtrl',
      templateUrl: 'components/vendorProfile/vendorProfile.tpl.html'
    });
});