var module = angular.module('OfficeHours.client');
module.controller('appointmentCtrl', function ($scope, $rootScope, $http, serviceUrl, Upload, appointment, userService, $state, sinchService) {
  $scope.model = {};
  $scope.callback = {};
  $scope.model.appointment = appointment;
  $scope.model.tab = 'video';

  $scope.model.chatItems = [];
  $scope.model.files = [];

  $scope.callback.uploadFiles = function (files) {
    if (files && files.length) {
      Upload.base64DataUrl(files[0]).then(function (c) {
        var file = {
          name: fixName($rootScope.user.name),
          url: c,
          progress:0,
          fileName: files[0].name,
          left: true
        };
        $scope.model.files.push(file);

        var chunks = chunkString(c, 200);
        for (var i = 0; i < chunks.length; i++) {
          (function (chunk, index, length) {
            setTimeout(function () {
              sinchService.sendChat($scope.model.otherId, {
                type: 'file',
                index: index,
                length: length,
                name: fixName($rootScope.user.name),
                chunk: chunk,
                fileName: files[0].name
              });

              file.progress=index/length;
              $scope.$apply();

            }, 10*index);
          })(chunks[i], i, chunks.length);
        }
        setTimeout(function () {
          file.progress=-1;
          $scope.$apply();
        }, 10*chunks.length);


      });
    }
  };
  $scope.model.fileDownloading = null;

  sinchService.onMessageReceive = function (message) {
    switch (message.type) {
      case 'chat':
        $scope.model.chatItems.push({
          name: message.name,
          message: message.message,
          left: false
        });
        break;

      case 'file':
        if (!$scope.model.fileDownloading) {
          $scope.model.fileDownloading = []
        }
        $scope.model.fileDownloading.push(message);

        if ($scope.model.fileDownloading.length == message.length) {
          var file = putBack();
          $scope.model.files.push({
            name: message.name,
            url: file,
            fileName: $scope.model.fileDownloading[0].fileName,
            left: false
          });
          $scope.model.fileDownloading=null;
        }
        break;
    }
    $scope.$apply();
  };
  function putBack() {
    var str = '';
    for (var i = 0; i < $scope.model.fileDownloading[0].length; i++) {

      var chunk = null;
      for (var q = 0; q < $scope.model.fileDownloading.length; q++) {
        if ($scope.model.fileDownloading[q].index == i) {
          chunk = $scope.model.fileDownloading[q];
          break;
        }
      }
      if (chunk == null) {
        console.log('missing chunk ' + i);
        continue
      }

      str += chunk.chunk;


    }

    return str;

  }

  function fixName(str) {
    return str.split(' ').map(function (d) {
      return d[0]
    }).join(' ');
  }

  $scope.callback.sendChat = function () {
    if (!$scope.model.chatMessage.length) {
      return;
    }
    $scope.model.chatItems.push({
      name: fixName($rootScope.user.name),
      message: $scope.model.chatMessage,
      left: true
    });

    sinchService.sendChat($scope.model.otherId, {type: 'chat', name: fixName($rootScope.user.name), message: $scope.model.chatMessage});
    $scope.model.chatMessage = '';
  };

  function chunkString(str, len) {
    var _size = Math.ceil(str.length / len),
      _ret = new Array(_size),
      _offset
      ;

    for (var _i = 0; _i < _size; _i++) {
      _offset = _i * len;
      _ret[_i] = str.substring(_offset, _offset + len);
    }

    return _ret;
  }


  userService.checkLogin().then(function () {
    if (appointment.memberId == $rootScope.user.id) {
      joinMember();
      $scope.model.otherId = appointment.vendorSinchUsername;
    } else if (appointment.vendorId == $rootScope.user.id) {
      joinVendor();
      $scope.model.otherId = appointment.memberSinchUsername;
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
    .state('inner.appointment', {
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