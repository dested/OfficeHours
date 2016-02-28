var module = angular.module('OfficeHours.client');
module.controller('bookVendorReceiptCtrl', function ($scope, $rootScope, userService, $http, serviceUrl, $state) {
  $scope.model = {};
  $scope.callback = {};

  $scope.model.slot = $rootScope.slot;
  $scope.model.vendor = $rootScope.vendor;
  $scope.model.user = $rootScope.user;
  $scope.model.appointment = $rootScope.appointment;
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.book-vendor-receipt', {
      //abstract: true,
      url: '/vendor/book/receipt',
      controller: 'bookVendorReceiptCtrl',
      templateUrl: 'components/bookVendor/bookVendorReceipt.tpl.html'

    });
});