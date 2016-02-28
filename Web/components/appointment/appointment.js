var module = angular.module('OfficeHours.client');
module.controller('appointmentCtrl', function ($scope, $rootScope, $http, serviceUrl, appointment, userService, $state, sinchService) {
  $scope.model = {};
  $scope.callback = {};
  $scope.model.appointment = appointment;

  userService.checkLogin().then(function () {
    if (appointment.memberId == $rootScope.user.id) {
      joinMember();
    } else if (appointment.vendorId == $rootScope.user.id) {
      joinVendor();
    } else {
      $state.go('main');
    }

  }).catch(function () {
    $state.go('main');
  });

  function joinMember() {
    sinchService.checkAccount($rootScope.user).then(function () {
      sinchService.startCallMember($rootScope.user);
    }).catch(function (d) {
      console.log(d);
    });
  }

  function joinVendor() {
    sinchService.checkAccount($rootScope.user).then(function () {
      sinchService.startCallVendor($rootScope.user, appointment);
    }).catch(function (d) {
      console.log(d);
    })
  }


});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('appointment', {
      //abstract: true,
      url: '/appointment/{id}',
      controller: 'appointmentCtrl',
      templateUrl: 'components/appointment/appointment.tpl.html',
      resolve: {
        appointment: function (serviceUrl, $stateParams, $http) {
          return $http({
            method: "GET",
            url: serviceUrl.path('${api}/appointment/' + $stateParams.id),
            extractResponse: 'appointment'
          }).monitor();
        }
      }
    });
});