var module = angular.module('OfficeHours.client');
module.controller('vendorProfilePublicCtrl', function ($scope, $rootScope, userService, $http, serviceUrl, $state, user) {
  $scope.model = {};
  $scope.callback = {};
  $scope.model.user = user;
  $scope.model.activeTab = 'available';
  $scope.model.calendar = null;

  $scope.callback.changeTab=function (state) {
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
            taken:false
          });
        }
      }
      $scope.model.calendarDays.push(day);
    }


    for (var i = 0; i < j.appointments.length; i++) {
      var appointment = j.appointments[i];
      var aStart=new Date(appointment.startDate);
      var aEnd=new Date(appointment.endDate);
      debugger;

      for (var k = 0; k < $scope.model.calendarDays.length; k++) {
        var _day = $scope.model.calendarDays[k];
        for (var l = 0; l < _day.slots.length; l++) {
          var slot = _day.slots[l];
          var realStartTime=new Date((+day.day)+(+slot.startTime-+new Date(1987,6,22)));
          var realEndTime=new Date((+day.day)+(+slot.endTime-+new Date(1987,6,22)));
          if(realStartTime<=aEnd && aStart<=realEndTime){
            slot.taken=true;
          }
        }
      }
    }
  };

  $scope.callback.gotoProfile = function (profile) {
    window.url = profile.url;
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


  $scope.callback.scheduleAppointment = function () {
    userService.checkLogin().then(function () {
      var start = moment().add(1, 'minutes').add(2, 'days').toDate().toISOString();
      var end = moment().add(31, 'minutes').add(2, 'days').toDate().toISOString();
      var obj = {
        memberId: $rootScope.user.id,
        vendorId: user.id,
        startDate: start.substr(0, start.length - 1),
        endDate: end.substr(0, end.length - 1)
      };

      $http({
        method: "POST",
        url: serviceUrl.path('${api}/appointment/schedule'),
        data: obj
      }).then(function (body) {
        if (body.data.error == 'None') {
          alert('created');
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
    .state('inner.vendor-profile-public', {
      //abstract: true,
      url: '/vendor/{email}',
      controller: 'vendorProfilePublicCtrl',
      templateUrl: 'components/vendorProfilePublic/vendorProfilePublic.tpl.html',
      resolve: {
        user: function (serviceUrl, $stateParams, $http) {
          return $http({
            method: "GET",
            url: serviceUrl.path('${api}/user/vendor/' + $stateParams.email),
            extractResponse: 'user'
          });
        }
      }
    });
});