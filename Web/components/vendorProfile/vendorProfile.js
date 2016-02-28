var module = angular.module('OfficeHours.client');
module.controller('vendorProfileCtrl', function ($scope, $rootScope, userService, $http, serviceUrl, $state) {
  $scope.model = {};
  $scope.callback = {};
  var user=$rootScope.user;
  $scope.model.user = $rootScope.user;
  $scope.model.activeTab = 'available';
  $scope.model.calendar = null;

  $scope.callback.changeTab = function (state) {
    $scope.model.activeTab = state;
    $scope.model.calendarDays = [];
    $scope.callback.buildCalendarDays(0);
    $scope.model.calendarDays[0].open = true;
  };

  $http({
    method: "GET",
    url: serviceUrl.path('${api}/user/' + user.id + '/vendor-availability')
  }).then(function (body) {
    $scope.model.calendar = body.data;
    $scope.model.calendarDays = [];
    $scope.callback.buildCalendarDays(0);
    $scope.model.calendarDays[0].open = true;
  }).monitor();


  $scope.callback.openDay = function (day) {
    if (day.open) {
      day.open = false;
    } else {
      for (var i = 0; i < $scope.model.calendarDays.length; i++) {
        var d = $scope.model.calendarDays[i];
        d.open = false;
      }
      day.open = true;
    }
  };
  $scope.callback.buildCalendarDays = function (daysFuture) {
    $scope.model.currentFutureDays = daysFuture;
    var now = moment();
    var j = $scope.model.calendar;

    var price = $scope.model.user.vendor.price || 99;
    for (var i = daysFuture; i < daysFuture + 3; i++) {
      var day = {};
      var today = moment().add(i, 'days');

      day.day = new Date(+today.toDate());
      day.open = false;
      day.slots = [];

      var scheduleDay = j.schedule.days[today.weekday()];

      for (var k = 0; k < scheduleDay.blocks.length; k++) {
        var block = scheduleDay.blocks[k];
        var s = moment(block.startTime);
        var e = moment(block.endTime);
        while (s < e) {
          var c = new Date(+s.toDate());
          s = s.add(30, 'minutes');
          day.slots.push({
            startTime: c,
            endTime: new Date(+s.toDate()),
            price: price,
            taken: false
          });
        }
      }
      $scope.model.calendarDays.push(day);
    }


    for (var i = 0; i < j.appointments.length; i++) {
      var appointment = j.appointments[i];
      var aStart = new Date(appointment.startDate);
      var aEnd = new Date(appointment.endDate);

      for (var k = 0; k < $scope.model.calendarDays.length; k++) {
        var _day = $scope.model.calendarDays[k];
        for (var l = 0; l < _day.slots.length; l++) {
          var slot = _day.slots[l];
          var realStartTime = new Date((+day.day) + (+slot.startTime - +new Date(1987, 6, 22)));
          var realEndTime = new Date((+day.day) + (+slot.endTime - +new Date(1987, 6, 22)));
          if (realStartTime <= aEnd && aStart <= realEndTime) {
            slot.taken = true;
          }
        }
      }
    }
  };

  $scope.callback.getStars = function (stars) {
    return 'FGHIJKLMN'[8 - (stars <= 2 ? 0 : stars - 2)];
  };
  $scope.callback.getAverageStarsDisplay = function () {
    var c = 0;

    for (var i = 0; i < $scope.model.user.vendor.reviews.length; i++) {
      var review = $scope.model.user.vendor.reviews[i];
      c += review.stars;
    }
    var avg = c / $scope.model.user.vendor.reviews.length;
    return avg / 2;


  };
  $scope.callback.getAverageStars = function (stars) {

    var c = 0;

    for (var i = 0; i < $scope.model.user.vendor.reviews.length; i++) {
      var review = $scope.model.user.vendor.reviews[i];
      c += review.stars;
    }
    var avg = c / $scope.model.user.vendor.reviews.length;
    return avg | 0;

  };

});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('inner.vendor-profile', {
      //abstract: true,
      url: '/vendor-profile',
      controller: 'vendorProfileCtrl',
      templateUrl: 'components/vendorProfile/vendorProfile.tpl.html',
      resolve:{
        user:function (userService) {
          return userService.checkLogin();
        }
      }
    });
});