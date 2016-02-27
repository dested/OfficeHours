var module = angular.module('OfficeHours.client');
module.controller('vendorProfilePublicCtrl', function ($scope, $rootScope,userService,$http, serviceUrl,$state,vendor) {
  $scope.model = {};
  $scope.callback = {};
  $scope.model.vendor=vendor;


  $scope.callback.scheduleAppointment=function(){
    userService.checkLogin().then(function(){
      var start=moment().add(1,'minutes').add(2,'days').toDate().toISOString();
      var end = moment().add(31,'minutes').add(2,'days').toDate().toISOString();
      var obj={
        memberId:$rootScope.user.id,
        vendorId:vendor.id,
        startDate:start.substr(0,start.length-1),
        endDate:end.substr(0,end.length-1)
      };

      $http({
        method: "POST",
        url: serviceUrl.path('${api}/appointment/schedule'),
        data:obj
      }).then(function(body){
        if(body.data.error=='None'){
          alert('created');
        }else{
          alert(body.data.error);
        }
      }).monitor();
    }).catch(function(){
      $state.go('login');
    }).monitor();
  }

});

module.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('vendor-profile-public', {
      //abstract: true,
      url: '/vendor/{email}',
      controller: 'vendorProfilePublicCtrl',
      templateUrl: 'components/vendorProfilePublic/vendorProfilePublic.tpl.html',
      resolve:{
        vendor:function(serviceUrl,$stateParams,$http){
          return $http({
            method: "GET",
            url: serviceUrl.path('${api}/user/vendor/'+$stateParams.email),
            extractResponse: 'vendor'
          });
        }
      }
    });
});