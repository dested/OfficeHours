var module = angular.module('OfficeHours.client');
module.controller('conferenceCtrl', function ($scope, $http, serviceUrl) {
  $scope.model = {};
  $scope.callback = {};

  var sinchClient = new SinchClient({
    applicationKey: '1321b3c3-f27b-4a5f-a3a0-d117aab8894f',
    capabilities: {calling: true, video: true},
    supportActiveConnection: true,
    onLogMessage: function(message) {
      console.log(message);
    },
  });

  sinchClient.startActiveConnection();



  alert('');

});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('conference', {
      //abstract: true,
      url: '/conference',
      controller: 'conferenceCtrl',
      templateUrl: 'components/conference/conference.tpl.html'
    });
});