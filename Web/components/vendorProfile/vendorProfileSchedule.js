var module = angular.module('OfficeHours.client');
module.controller('vendorProfileScheduleCtrl', function ($scope, $rootScope, userService, $http, serviceUrl, $state) {
  $scope.model = {};
  $scope.model.daysData = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  $scope.callback = {};
  var user = $rootScope.user;
  $scope.model.schedule = user.vendor.schedule;
  $scope.model.schedule.days[0].open = true;

  $scope.callback.openDay = function (day) {
    if (day.open) {
      day.open = false;
    } else {
      for (var i = 0; i < $scope.model.schedule.days.length; i++) {
        var d = $scope.model.schedule.days[i];
        d.open = false;
      }
      day.open = true;
    }
  };

  $scope.callback.editBlock = function (block) {
    $scope.model.editBlock = block;
  };


});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.vendor-profile-schedule', {
      //abstract: true,
      url: '/vendor-profile-schedule',
      controller: 'vendorProfileScheduleCtrl',
      templateUrl: 'components/vendorProfile/vendorProfileSchedule.tpl.html',
      resolve: {
        user: function (userService) {
          return userService.checkLogin();
        }
      }
    });
});