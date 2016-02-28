var module = angular.module('OfficeHours.client');
module.controller('bookVendorCtrl', function ($scope, $rootScope, userService, $http, serviceUrl, $state) {
  $scope.model = {};
  $scope.callback = {};

  $scope.model.slot = $rootScope.slot;
  $scope.model.vendor = $rootScope.vendor;

  $scope.callback.book = function () {
    userService.checkLogin().then(function () {
      var start = new Date((+$rootScope.day.day) + (+$scope.model.slot.startTime - +new Date(1987, 6, 22))).toISOString();
      var end = new Date((+$rootScope.day.day) + (+$scope.model.slot.endTime - +new Date(1987, 6, 22))).toISOString();

      var obj = {
        memberId: $rootScope.user.id,
        vendorId: $scope.model.vendor.id,
        startDate: start.substr(0, start.length - 1),
        endDate: end.substr(0, end.length - 1)
      };

      $http({
        method: "POST",
        url: serviceUrl.path('${api}/appointment/schedule'),
        data: obj
      }).then(function (body) {
        if (body.data.error == 'None') {
          $rootScope.appointment = body.data.appointment;
          $state.go('inner.book-vendor-receipt')
        } else {
          alert(body.data.error);
        }
      }).monitor();
    }).catch(function () {
      $state.go('inner.login');
    }).monitor();

  }
});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.book-vendor', {
      //abstract: true,
      url: '/vendor/book',
      controller: 'bookVendorCtrl',
      templateUrl: 'components/bookVendor/bookVendor.tpl.html'

    });
});